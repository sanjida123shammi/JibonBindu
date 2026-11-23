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
      // Brand & Topbar
      brandName: 'Jibonbindu',
      tagline: 'Life Saver Network',
      home: 'Home',
      dashboard: 'Dashboard',
      liveChat: 'Live Chat',
      myProfile: 'My Profile',
      logout: 'Logout',
      messages: 'Messages',
      settings: 'Settings',
      notifications: 'Notifications',
      noNotifications: 'No new notifications',
      markAllRead: 'Mark all as read',
      admin: 'Admin',
      searchPlaceholder: 'Search cases, donors, records...',
      reactSpaBadge: 'Connected with React SPA Portal',
      verifiedAccount: 'VERIFIED ACCOUNT',

      // Sidebar & Menu Options
      caseRequest: 'Case Request',
      newRequest: 'New Request',
      caseList: 'Case List',
      bloodDonor: 'Blood Donor',
      addNewDonor: 'Add New Donor',
      bloodDonorList: 'Blood Donor List',
      fundManagement: 'Fund Management',
      fundDeposit: 'Fund Deposit',
      addNewDeposit: 'Add New Deposit',
      depositHistory: 'Deposit History',
      fundCosting: 'Fund Costing',
      addNewCosting: 'Add New Costing',
      costingHistory: 'Costing History',
      member: 'Member',
      addNewMember: 'Add New Member',
      memberList: 'Member List',
      roleAssign: 'Role Assign',
      roles: 'Roles',
      memberRoles: 'Member Roles',
      viewAllUsers: 'View All Users',
      fundDonation: 'Fund Donation',
      wantToBeMember: 'Want to be a member',
      donateBlood: 'Donate Blood',

      // Dashboard
      totalCaseRequest: 'Total Case Request',
      totalSolvedCase: 'Total solved Case by Jibonbindu',
      totalDonor: 'Total Donor',
      totalMembers: 'Total Members',
      yearlyBloodDonation: 'Yearly Blood Donation Graph',
      bloodDonationSubtitle: 'Monthly units donated across regions',
      month: 'Month',
      unitsDonated: 'Units Donated',
      recentActivity: 'Live Activity & Blood Matches',
      quickEmergency: 'Create Urgent Case Request',

      // Case Requests Page & Form
      caseRequestsHeading: 'Case Requests',
      caseRequestsSub: 'Live emergency requests registered across hospitals and blood banks',
      allCaseRequests: 'All Case Requests',
      newCaseRequestHeading: 'New Case Request',
      newCaseRequestSub: 'Register an urgent blood request for hospital patients',
      editCaseRequestHeading: 'Edit Case Request',
      creationDate: 'Creation Date (Current Date)',
      requiredBloodGroup: 'Required Blood Group',
      patientProblem: 'Patient Problem / Reason',
      bloodQuantity: 'Bags Quantity',
      hemoglobin: 'Hemoglobin Level (g/dL)',
      donationDate: 'Donation Date (Click to open calendar)',
      donationTime: 'Donation Time',
      donationPlace: 'Donation Place (Hospital / Clinic)',
      contactNumber: 'Contact Number',
      donorContactNo: 'Donor Contact No (Optional)',
      reference: 'Reference (Source or Person)',
      caseStatus: 'Case Status',
      remarks: 'Remarks',
      patientRelationshipCheck:
        'This case request is submitted for myself or my direct family member',
      createCaseRequest: 'Create Case Request',
      updateCaseRequest: 'Update Case Request',
      emergencyBloodFormTitle: 'Emergency Blood Request Form',
      emergencyBloodFormSub: 'All details sync with the live database and donor broadcast network',

      // Blood Donors Page & Form
      bloodDonorsHeading: 'Blood Donors',
      bloodDonorsSub:
        'Directory of volunteer blood donors registered across hospitals and foundation network',
      allBloodDonors: 'All Blood Donors',
      newDonorHeading: 'Add New Blood Donor',
      newDonorSub:
        'Register or update active blood donors with clinical, availability, and location details',
      editDonorHeading: 'Edit Blood Donor',
      firstName: 'First Name',
      lastName: 'Last Name',
      fullName: 'Full Name',
      bloodGroup: 'Blood Group',
      district: 'District',
      city: 'City',
      area: 'Area / Sub-locality',
      address: 'Full Address Line',
      dateOfBirth: 'Date of Birth (Click to open calendar)',
      donorAvailabilityStatus: 'Donor Availability Status',
      lastDonationDate: 'Last Blood Donation Date (M/D/Y)',
      lastDonationType: 'Last Donation Type',
      totalDonations: 'Total Previous Donations',
      preferableLocation: 'Preferable Location',
      preferableTime: 'Preferable Time',
      discontinueStatus: 'Discontinue Status (Active / Inactive)',
      registerAsBloodDonor: 'Register as Blood Donor',
      updateBloodDonor: 'Update Blood Donor',

      // Fund Management Pages & Forms
      fundDepositsHeading: 'Fund Deposits',
      fundDepositsSub:
        'Financial inflow log including donations, campaigns, member contributions and grants',
      newDepositHeading: 'Add New Deposit',
      newDepositSub: 'Record cash or online fund deposit transactions',
      depositDate: 'Deposit Date (M/D/Y)',
      fundDonorType: 'Fund Donor Type',
      donorName: 'Donor Name',
      depositAmount: 'Deposit Amount (BDT)',
      receivedBy: 'Received By',
      paymentMethod: 'Payment Method (Cash / Online)',
      depositVoucherTitle: 'New Fund Deposit Entry',
      updateDepositRecord: 'Update Deposit Record',
      fundCostingsHeading: 'Daily Costing History',
      fundCostingsSub:
        'Expense log for emergency blood campaigns, transport, equipment and daily operations',
      newCostingHeading: 'Add New Costing',
      newCostingSub:
        'Record campaign expenses, transport, medical or administrative operational costs',
      costingDate: 'Costing Date (M/D/Y)',
      spentByPerson: 'Spent By (Person / Member)',
      expensePurpose: 'Expense Purpose / Reason',
      costAmount: 'Cost Amount (BDT)',
      settlementStatus: 'Fund Settlement Status',
      costingVoucherTitle: 'New Operational Costing Entry',
      updateCostingRecord: 'Update Costing Record',

      // Member Pages & Form
      membersHeading: 'Team Members',
      membersSub:
        'Directory of executive coordinators, volunteers, and verified foundation members',
      allMembers: 'All Members',
      newMemberHeading: 'Add New Member',
      newMemberSub:
        'Register blood donation foundation members, executive coordinators, and field volunteers',
      editMemberHeading: 'Edit Member Profile',
      nidNumber: 'National ID (NID) Number',
      birthCertificateNo: 'Birth Certificate No',
      emailAccount: 'Email Account',
      memberPhoto: 'Member Photo',
      uploadPhoto: 'Upload Photo',
      changePhoto: 'Change Photo',
      registerMember: 'Register Member',
      updateMember: 'Update Member',

      // Roles, Users & Profile Pages
      rolesHeading: 'Roles Management',
      rolesSub: 'Manage system security roles stored in AspNetRoles',
      memberRolesHeading: 'Member Roles Assignment',
      memberRolesSub: 'Assign foundation designations and permissions to team members',
      usersHeading: 'All System Users',
      usersSub: 'Directory of registered identity accounts across the JibonBindu platform',
      supportFoundation: 'Support Jibonbindu Foundation',
      supportFoundationSub: 'Every life-saving drop begins with your generosity',
      wantToBeMemberHeading: 'Want to be a member',
      wantToBeMemberSub: 'Join our volunteer team and help us save more lives',
      donateBloodHeading: 'Donate Blood',
      donateBloodSub:
        'Register or update active blood donors with clinical, availability, and location details',
      profileHeading: 'My Profile',
      profileSub: 'Personal Information, Credentials & Security Settings',
      personalInfo: 'Personal Information',
      mobileNumber: 'Mobile Number',
      location: 'Location',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',

      // Common Buttons & Labels
      cancel: 'Cancel',
      save: 'Save',
      saveChanges: 'Save Changes',
      sendRequest: 'Send Request',
      updateInfo: 'Update Info',
      actions: 'Actions',
      status: 'Status',
      loading: 'Saving...',
    },
    bn: {
      // Brand & Topbar
      brandName: 'জীবনবিন্দু',
      tagline: 'জীবন রক্ষাকারী নেটওয়ার্ক',
      home: 'হোম',
      dashboard: 'ড্যাশবোর্ড',
      liveChat: 'লাইভ চ্যাট',
      myProfile: 'আমার প্রোফাইল',
      logout: 'লগআউট',
      messages: 'মেসেজসমূহ',
      settings: 'সেটিংস',
      notifications: 'নোটিফিকেশন',
      noNotifications: 'কোনো নতুন নোটিফিকেশন নেই',
      markAllRead: 'সবগুলো পঠিত চিহ্নিত করুন',
      admin: 'অ্যাডমিন',
      searchPlaceholder: 'কেস, রক্তদাতা বা তথ্য খুঁজুন...',
      reactSpaBadge: 'রিঅ্যাক্ট এসপিএ পোর্টালের সাথে সংযুক্ত',
      verifiedAccount: 'ভেরিফাইড একাউন্ট',

      // Sidebar & Menu Options
      caseRequest: 'কেস রিকোয়েস্ট',
      newRequest: 'নতুন রিকোয়েস্ট',
      caseList: 'কেস তালিকা',
      bloodDonor: 'রক্তদাতা',
      addNewDonor: 'নতুন রক্তদাতা যোগ',
      bloodDonorList: 'রক্তদাতার তালিকা',
      fundManagement: 'তহবিল ব্যবস্থাপনা',
      fundDeposit: 'তহবিল জমা',
      addNewDeposit: 'নতুন জমা যোগ',
      depositHistory: 'জমার ইতিহাস',
      fundCosting: 'তহবিল খরচ',
      addNewCosting: 'নতুন খরচ যোগ',
      costingHistory: 'খরচের ইতিহাস',
      member: 'সদস্য',
      addNewMember: 'নতুন সদস্য যোগ',
      memberList: 'সদস্য তালিকা',
      roleAssign: 'রোল বরাদ্দ',
      roles: 'রোলসমূহ',
      memberRoles: 'সদস্য রোলসমূহ',
      viewAllUsers: 'সকল ব্যবহারকারী',
      fundDonation: 'তহবিল অনুদান',
      wantToBeMember: 'সদস্য হতে চাই',
      donateBlood: 'রক্ত দান করুন',

      // Dashboard
      totalCaseRequest: 'মোট কেস রিকোয়েস্ট',
      totalSolvedCase: 'জীবনবিন্দু কর্তৃক মোট সমাধানকৃত কেস',
      totalDonor: 'মোট রক্তদাতা',
      totalMembers: 'মোট সদস্য',
      yearlyBloodDonation: 'বাৎসরিক রক্তদান গ্রাফ',
      bloodDonationSubtitle: 'মাসভিত্তিক রক্ত সংগ্রহের পরিসংখ্যান',
      month: 'মাস',
      unitsDonated: 'ইউনিট সংখ্যা',
      recentActivity: 'সাম্প্রতিক কার্যক্রম ও ডোনার ম্যাচ',
      quickEmergency: 'জরুরি কেস রিকোয়েস্ট তৈরি করুন',

      // Case Requests Page & Form
      caseRequestsHeading: 'কেস রিকোয়েস্টসমূহ',
      caseRequestsSub: 'হাসপাতাল ও ব্লাড ব্যাংকসমূহে নিবন্ধিত জরুরি রক্তের রিকোয়েস্ট',
      allCaseRequests: 'সকল কেস রিকোয়েস্ট',
      newCaseRequestHeading: 'নতুন কেস রিকোয়েস্ট',
      newCaseRequestSub: 'হাসপাতালের রোগীর জন্য জরুরি রক্তের রিকোয়েস্ট নিবন্ধন করুন',
      editCaseRequestHeading: 'কেস রিকোয়েস্ট সম্পাদনা',
      creationDate: 'আবেদনের তারিখ (বর্তমান তারিখ)',
      requiredBloodGroup: 'প্রয়োজনীয় রক্তের গ্রুপ',
      patientProblem: 'রোগীর সমস্যা / কারণ',
      bloodQuantity: 'রক্তের পরিমাণ (ব্যাগ)',
      hemoglobin: 'হিমোগ্লোবিন মাত্রা (g/dL)',
      donationDate: 'রক্তদানের তারিখ (ক্যালেন্ডার খুলতে ক্লিক করুন)',
      donationTime: 'রক্তদানের সময়',
      donationPlace: 'রক্তদানের স্থান (হাসপাতাল / ক্লিনিক)',
      contactNumber: 'যোগাযোগের নম্বর',
      donorContactNo: 'রক্তদাতার যোগাযোগের নম্বর (ঐচ্ছিক)',
      reference: 'রেফারেন্স (উৎস বা ব্যক্তি)',
      caseStatus: 'কেস স্ট্যাটাস',
      remarks: 'মন্তব্য',
      patientRelationshipCheck: 'এই রক্তের রিকোয়েস্টটি আমার নিজের বা আমার পরিবারের সদস্যের জন্য',
      createCaseRequest: 'কেস রিকোয়েস্ট তৈরি করুন',
      updateCaseRequest: 'কেস রিকোয়েস্ট আপডেট করুন',
      emergencyBloodFormTitle: 'জরুরি রক্তের রিকোয়েস্ট ফর্ম',
      emergencyBloodFormSub: 'সকল তথ্য সরাসরি ডেটাবেজ ও লাইভ রক্তদাতা নেটওয়ার্কে যুক্ত হবে',

      // Blood Donors Page & Form
      bloodDonorsHeading: 'রক্তদাতাগণ',
      bloodDonorsSub: 'হাসপাতাল ও ফাউন্ডেশন নেটওয়ার্কে নিবন্ধিত স্বেচ্ছাসেবী রক্তদাতাদের তালিকা',
      allBloodDonors: 'সকল রক্তদাতা',
      newDonorHeading: 'নতুন রক্তদাতা যোগ',
      newDonorSub: 'স্বাস্থ্য তথ্য, প্রাপ্যতা ও অবস্থানসহ রক্তদাতা নিবন্ধন করুন',
      editDonorHeading: 'রক্তদাতার তথ্য সম্পাদনা',
      firstName: 'নামের প্রথম অংশ',
      lastName: 'নামের শেষ অংশ',
      fullName: 'সম্পূর্ণ নাম',
      bloodGroup: 'রক্তের গ্রুপ',
      district: 'জেলা',
      city: 'শহর',
      area: 'এলাকা / উপ-এলাকা',
      address: 'সম্পূর্ণ ঠিকানা',
      dateOfBirth: 'জন্ম তারিখ (ক্যালেন্ডার খুলতে ক্লিক করুন)',
      donorAvailabilityStatus: 'রক্তদাতার প্রাপ্যতা অবস্থা',
      lastDonationDate: 'সর্বশেষ রক্তদানের তারিখ (মাস/দিন/বছর)',
      lastDonationType: 'সর্বশেষ রক্তদানের ধরন',
      totalDonations: 'মোট পূর্ববর্তী রক্তদান',
      preferableLocation: 'পছন্দের স্থান / হাসপাতাল',
      preferableTime: 'পছন্দের সময়',
      discontinueStatus: 'সক্রিয়তা অবস্থা (সক্রিয় / নিষ্ক্রিয়)',
      registerAsBloodDonor: 'রক্তদাতা হিসেবে নিবন্ধন করুন',
      updateBloodDonor: 'রক্তদাতার তথ্য আপডেট করুন',

      // Fund Management Pages & Forms
      fundDepositsHeading: 'তহবিল জমা',
      fundDepositsSub: 'অনুদান, ক্যাম্পেইন, সদস্য চাঁদা এবং সহায়তাসহ আর্থিক জমার হিসাব',
      newDepositHeading: 'নতুন জমা যোগ',
      newDepositSub: 'নগদ বা অনলাইন তহবিল জমার লেনদেন রেকর্ড করুন',
      depositDate: 'জমার তারিখ (মাস/দিন/বছর)',
      fundDonorType: 'অনুদানদাতার ধরন',
      donorName: 'অনুদানদাতার নাম',
      depositAmount: 'জমার পরিমাণ (টাকা)',
      receivedBy: 'গ্রহীতা / আদায়কারী',
      paymentMethod: 'পেমেন্টের মাধ্যম (নগদ / অনলাইন)',
      depositVoucherTitle: 'নতুন তহবিল জমার ভাউচার',
      updateDepositRecord: 'জমার রেকর্ড আপডেট করুন',
      fundCostingsHeading: 'দৈনিক খরচের ইতিহাস',
      fundCostingsSub: 'রক্তদান কর্মসূচি, যাতায়াত, সরঞ্জাম ও দৈনন্দিন খরচের হিসাব',
      newCostingHeading: 'নতুন খরচ যোগ',
      newCostingSub: 'ক্যাম্পেইন খরচ, যাতায়াত বা প্রশাসনিক ব্যয় রেকর্ড করুন',
      costingDate: 'খরচের তারিখ (মাস/দিন/বছর)',
      spentByPerson: 'ব্যয়কারী (সদস্য / ব্যক্তি)',
      expensePurpose: 'খরচের বিবরণ / উদ্দেশ্য',
      costAmount: 'খরচের পরিমাণ (টাকা)',
      settlementStatus: 'তহবিল নিষ্পত্তির অবস্থা',
      costingVoucherTitle: 'নতুন পরিচালনা ব্যয়ের হিসাব',
      updateCostingRecord: 'খরচের হিসাব আপডেট করুন',

      // Member Pages & Form
      membersHeading: 'টিম সদস্যবৃন্দ',
      membersSub: 'সমন্বয়ক, স্বেচ্ছাসেবী ও নিবন্ধিত সদস্যদের তালিকা',
      allMembers: 'সকল সদস্য',
      newMemberHeading: 'নতুন সদস্য যোগ',
      newMemberSub: 'ফাউন্ডেশনের সদস্য, নির্বাহী সমন্বয়ক ও মাঠপর্যায়ের ভলান্টিয়ার নিবন্ধন করুন',
      editMemberHeading: 'সদস্যের তথ্য সম্পাদনা',
      nidNumber: 'জাতীয় পরিচয়পত্র (NID) নম্বর',
      birthCertificateNo: 'জন্ম নিবন্ধন নম্বর',
      emailAccount: 'ইমেইল অ্যাকাউন্ট',
      memberPhoto: 'সদস্যের ছবি',
      uploadPhoto: 'ছবি আপলোড',
      changePhoto: 'ছবি পরিবর্তন',
      registerMember: 'সদস্য নিবন্ধন করুন',
      updateMember: 'সদস্যের তথ্য আপডেট করুন',

      // Roles, Users & Profile Pages
      rolesHeading: 'রোল ব্যবস্থাপনা',
      rolesSub: 'সিস্টেমের নিরাপত্তা ও ব্যবহারকারী রোল ব্যবস্থাপনা',
      memberRolesHeading: 'সদস্য রোল বরাদ্দ',
      memberRolesSub: 'সদস্যদের প্রাতিষ্ঠানিক পদবী ও অনুমতি প্রদান',
      usersHeading: 'সকল ব্যবহারকারী',
      usersSub: 'জীবনবিন্দু প্ল্যাটফর্মের সকল নিবন্ধিত অ্যাকাউন্টের তালিকা',
      supportFoundation: 'জীবনবিন্দু ফাউন্ডেশনে অনুদান দিন',
      supportFoundationSub: 'আপনার একটু সহায়তায় বেঁচে যেতে পারে একটি মূল্যবান প্রাণ',
      wantToBeMemberHeading: 'সদস্য হতে চাই',
      wantToBeMemberSub: 'আমাদের স্বেচ্ছাসেবী দলে যোগ দিন এবং জীবন বাঁচাতে অংশ নিন',
      donateBloodHeading: 'রক্ত দান করুন',
      donateBloodSub: 'রক্তদাতা হিসেবে নিবন্ধন করুন এবং প্রয়োজনে রক্তদান করে পাশে থাকুন',
      profileHeading: 'আমার প্রোফাইল',
      profileSub: 'ব্যক্তিগত তথ্য, অ্যাকাউন্টের পরিচয় ও নিরাপত্তা সেটিংস',
      personalInfo: 'ব্যক্তিগত তথ্য',
      mobileNumber: 'মোবাইল নম্বর',
      location: 'অবস্থান / ঠিকানা',
      changePassword: 'পাসওয়ার্ড পরিবর্তন করুন',
      currentPassword: 'বর্তমান পাসওয়ার্ড',
      newPassword: 'নতুন পাসওয়ার্ড',
      confirmPassword: 'নতুন পাসওয়ার্ড নিশ্চিত করুন',

      // Common Buttons & Labels
      cancel: 'বাতিল',
      save: 'সংরক্ষণ করুন',
      saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
      sendRequest: 'রিকোয়েস্ট পাঠান',
      updateInfo: 'তথ্য আপডেট করুন',
      actions: 'কার্যক্রম',
      status: 'অবস্থা',
      loading: 'সংরক্ষণ করা হচ্ছে...',
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
