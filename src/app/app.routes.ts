import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CaseListComponent } from './components/case-request/case-list/case-list.component';
import { CaseFormComponent } from './components/case-request/case-form/case-form.component';
import { DonorListComponent } from './components/blood-donor/donor-list/donor-list.component';
import { DonorFormComponent } from './components/blood-donor/donor-form/donor-form.component';
import { DepositListComponent } from './components/fund-management/deposit-list/deposit-list.component';
import { DepositFormComponent } from './components/fund-management/deposit-form/deposit-form.component';
import { CostingListComponent } from './components/fund-management/costing-list/costing-list.component';
import { CostingFormComponent } from './components/fund-management/costing-form/costing-form.component';
import { MemberListComponent } from './components/member/member-list/member-list.component';
import { MemberFormComponent } from './components/member/member-form/member-form.component';

// Role & User Components
import { RolesComponent } from './components/roles/roles.component';
import { MemberRolesComponent } from './components/roles/member-roles/member-roles.component';
import { UserListComponent } from './components/users/user-list.component';
import { FundDonationComponent } from './components/fund-donation/fund-donation.component';
import { WantToBeMemberComponent } from './components/want-to-be-member/want-to-be-member.component';
import { DonateBloodComponent } from './components/donate-blood/donate-blood.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  // Public Auth Routes
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
    title: 'Jibonbindu | Login',
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard],
    title: 'Jibonbindu | Register',
  },

  // Protected App Routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Dashboard',
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | My Profile',
  },

  // Case Requests
  {
    path: 'cases',
    component: CaseListComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Case Requests',
  },
  {
    path: 'cases/new',
    component: CaseFormComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | New Case Request',
  },
  {
    path: 'cases/edit/:id',
    component: CaseFormComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Edit Case Request',
  },
  {
    path: 'case-request',
    redirectTo: 'cases',
    pathMatch: 'full',
  },

  // Blood Donors
  {
    path: 'donors',
    component: DonorListComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Blood Donor List',
  },
  {
    path: 'donors/new',
    component: DonorFormComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Add New Donor',
  },
  {
    path: 'donors/edit/:id',
    component: DonorFormComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Edit Blood Donor',
  },
  {
    path: 'blood-donor',
    redirectTo: 'donors',
    pathMatch: 'full',
  },

  // Fund Donation (Mobile Banking)
  {
    path: 'fund-donation',
    component: FundDonationComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Fund Donation',
  },

  // Want to be a Member
  {
    path: 'want-to-be-member',
    component: WantToBeMemberComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Want to be a Member',
  },

  // Donate Blood (Self-Registration for Seeker / Fund-Donor)
  {
    path: 'donate-blood',
    component: DonateBloodComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Donate Blood',
  },

  // Fund Deposits
  {
    path: 'funds/deposits',
    component: DepositListComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Fund Deposit History',
  },
  {
    path: 'funds/deposits/new',
    component: DepositFormComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Add New Deposit',
  },
  {
    path: 'funds/deposits/edit/:id',
    component: DepositFormComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Edit Fund Deposit',
  },

  // Fund Costings
  {
    path: 'funds/costings',
    component: CostingListComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Daily Costing History',
  },
  {
    path: 'funds/costings/new',
    component: CostingFormComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Add New Costing',
  },
  {
    path: 'funds/costings/edit/:id',
    component: CostingFormComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Edit Costing Entry',
  },

  // Members
  {
    path: 'members',
    component: MemberListComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Team Members',
  },
  {
    path: 'members/new',
    component: MemberFormComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Add Team Member',
  },
  {
    path: 'members/edit/:id',
    component: MemberFormComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Edit Member Profile',
  },

  // Role Assignment & User Management
  {
    path: 'roles',
    component: RolesComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Roles Management',
  },
  {
    path: 'roles/member-roles',
    component: MemberRolesComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | Member Roles Assignment',
  },
  {
    path: 'member-roles',
    redirectTo: 'roles/member-roles',
    pathMatch: 'full',
  },
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [authGuard],
    title: 'Jibonbindu | View All Users',
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
