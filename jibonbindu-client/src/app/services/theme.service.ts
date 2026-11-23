import { Injectable, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light';
export type AppLanguage = 'en' | 'bn';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly currentTheme = signal<AppTheme>('dark');
  readonly currentLanguage = signal<AppLanguage>('en');

  private translations: Record<AppLanguage, Record<string, string>> = {
    en: {
      brandName: 'Jibonbindu',
      tagline: 'Life Saver Network',
      home: 'Home',
      dashboard: 'Dashboard',
      liveChat: 'Live Chat',
      caseRequest: 'Case Request',
      bloodDonor: 'Blood Donor',
      newRequest: 'New Request',
      fundManagement: 'Fund Management',
      member: 'Member',
      myProfile: 'My Profile',
      logout: 'Logout',
      messages: 'Messages',
      settings: 'Settings',
      notifications: 'Notifications',
      noNotifications: 'No new notifications',
      markAllRead: 'Mark all as read',
      totalCaseRequest: 'Total Case Request',
      totalSolvedCase: 'Total solved Case by Jibonbindu',
      totalDonor: 'Total Donor',
      totalMembers: 'Total Members',
      yearlyBloodDonation: 'Yearly Blood Donation Graph',
      bloodDonationSubtitle: 'Monthly units donated across regions',
      month: 'Month',
      unitsDonated: 'Units Donated',
      admin: 'Admin',
      searchPlaceholder: 'Search cases, donors, records...',
      recentActivity: 'Live Activity & Blood Matches',
      quickEmergency: 'Create Urgent Case Request',
      reactSpaBadge: 'Connected with React SPA Portal',
    },
    bn: {
      brandName: 'জীবনবিন্দু',
      tagline: 'জীবন রক্ষাকারী নেটওয়ার্ক',
      home: 'হোম',
      dashboard: 'ড্যাশবোর্ড',
      liveChat: 'লাইভ চ্যাট',
      caseRequest: 'কেস রিকোয়েস্ট',
      bloodDonor: 'রক্তদাতা',
      newRequest: 'নতুন রিকোয়েস্ট',
      fundManagement: 'তহবিল ব্যবস্থাপনা',
      member: 'সদস্য',
      myProfile: 'আমার প্রোফাইল',
      logout: 'লগআউট',
      messages: 'মেসেজসমূহ',
      settings: 'সেটিংস',
      notifications: 'নোটিফিকেশন',
      noNotifications: 'কোনো নতুন নোটিফিকেশন নেই',
      markAllRead: 'সবগুলো পঠিত চিহ্নিত করুন',
      totalCaseRequest: 'মোট কেস রিকোয়েস্ট',
      totalSolvedCase: 'জীবনবিন্দু কর্তৃক মোট সমাধানকৃত কেস',
      totalDonor: 'মোট রক্তদাতা',
      totalMembers: 'মোট সদস্য',
      yearlyBloodDonation: 'বাৎসরিক রক্তদান গ্রাফ',
      bloodDonationSubtitle: 'মাসভিত্তিক রক্ত সংগ্রহের পরিসংখ্যান',
      month: 'মাস',
      unitsDonated: 'ইউনিট সংখ্যা',
      admin: 'অ্যাডমিন',
      searchPlaceholder: 'কেস, রক্তদাতা বা তথ্য খুঁজুন...',
      recentActivity: 'সাম্প্রতিক কার্যক্রম ও ডোনার ম্যাচ',
      quickEmergency: 'জরুরি কেস রিকোয়েস্ট তৈরি করুন',
      reactSpaBadge: 'রিঅ্যাক্ট এসপিএ পোর্টালের সাথে সংযুক্ত',
    },
  };

  constructor() {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('jb_theme') as AppTheme) || 'dark';
      this.currentTheme.set(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      const savedLang = localStorage.getItem('jb_lang') as AppLanguage;
      if (savedLang) {
        this.currentLanguage.set(savedLang);
      }
    }
  }

  toggleTheme(): void {
    const nextTheme: AppTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jb_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
  }

  toggleLanguage(): void {
    const nextLang: AppLanguage = this.currentLanguage() === 'en' ? 'bn' : 'en';
    this.currentLanguage.set(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jb_lang', nextLang);
    }
  }

  translate(key: string): string {
    const lang = this.currentLanguage();
    return this.translations[lang]?.[key] || this.translations.en[key] || key;
  }
}
