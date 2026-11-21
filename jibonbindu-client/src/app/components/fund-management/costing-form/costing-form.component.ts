import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PersonOption } from '../../../models/fund.model';
import { FundService } from '../../../services/fund.service';

@Component({
  selector: 'app-costing-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './costing-form.component.html',
  styleUrl: './costing-form.component.css',
})
export class CostingFormComponent implements OnInit {
  private fundService = inject(FundService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isEditMode = signal<boolean>(false);
  costingId: number | null = null;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  people: PersonOption[] = [];
  settlementStatuses: { id: number; name: string }[] = [];

  // Form Model
  costingDate: string = new Date().toISOString().substring(0, 10);
  spentByPersonId: number = 1;
  costAmount: number = 500;
  purpose: string = '';
  settlementStatusId: number = 1;
  remarks: string = '';

  ngOnInit(): void {
    this.fundService.getLookups().subscribe((resp) => {
      this.settlementStatuses = resp.settlementStatuses;
    });

    this.fundService.getPeople().subscribe((peopleList) => {
      this.people = peopleList;
      if (peopleList.length > 0 && !this.isEditMode()) {
        this.spentByPersonId = peopleList[0].personId;
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.costingId = parseInt(idParam, 10);
      if (this.costingId) {
        this.isEditMode.set(true);
        this.loadCostingData(this.costingId);
      }
    }
  }

  loadCostingData(id: number): void {
    this.fundService.getCostingById(id).subscribe((cost) => {
      if (cost) {
        this.costingDate = cost.costingDate.substring(0, 10);
        this.spentByPersonId = cost.spentByPersonId;
        this.costAmount = cost.costAmount;
        this.purpose = cost.purpose;
        this.settlementStatusId = cost.settlementStatusId;
        this.remarks = cost.remarks || '';

        this.cdr.detectChanges();
      } else {
        this.errorMessage.set(`Costing #${id} could not be loaded.`);
      }
    });
  }

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        // Fallback
      }
    }
  }

  onSubmit(): void {
    if (!this.costingDate || !this.costAmount || this.costAmount <= 0 || !this.purpose.trim()) {
      this.errorMessage.set('Please provide a costing date, positive amount, and purpose.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const dto = {
      costingDate: new Date(this.costingDate).toISOString(),
      spentByPersonId: Number(this.spentByPersonId),
      costAmount: Number(this.costAmount),
      purpose: this.purpose.trim(),
      settlementStatusId: Number(this.settlementStatusId),
      remarks: this.remarks.trim(),
    };

    if (this.isEditMode() && this.costingId) {
      this.fundService.updateCosting(this.costingId, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/funds/costings']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update costing entry.');
        },
      });
    } else {
      this.fundService.createCosting(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/funds/costings']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to register new costing.');
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/funds/costings']);
  }
}
