export type Lang = "bn" | "en";

export interface Strings {
  about: string;
  contact: string;
  advice: string;
  login: string;
  logout: string;
  dashboard: string;
  aboutText: string;
  contactText: string;
  contactPhone: string;
  contactEmail: string;
  ourAchievement: string;
  totalDonation: string;
  totalCase: string;
  totalDonor: string;
  totalMember: string;

  // Question Section
  getStartedHeading: string;
  qNeedBlood: string;
  qNeedBloodSub: string;
  qDonateBlood: string;
  qDonateBloodSub: string;
  qJoinFamily: string;
  qJoinFamilySub: string;
  qFinancialAid: string;
  qFinancialAidSub: string;

  // Eligibility Checker Section
  eligibilityTitle: string;
  eligibilitySub: string;
  resetQuestions: string;
  critAgeTitle: string;
  critAgeDesc: string;
  critWeightTitle: string;
  critWeightDesc: string;
  critIntervalTitle: string;
  critIntervalDesc: string;
  critHealthTitle: string;
  critHealthDesc: string;
  btnYes: string;
  btnNo: string;
  eligibleBannerTitle: string;
  eligibleBannerDesc: string;
  viewEmergencyReq: string;
  ineligibleBannerTitle: string;
  ineligibleBannerDesc: string;

  // Dedicated About & Read More
  readMore: string;
  aboutShortDesc: string;
  aboutTagline: string;
  aboutMissionTitle: string;
  aboutMissionDesc: string;
  aboutDifferentTitle: string;
  diffFreeTitle: string;
  diffFreeDesc: string;
  diffFundTitle: string;
  diffFundDesc: string;
  diffHealthTitle: string;
  diffHealthDesc: string;
  aboutStoryTitle: string;
  aboutStoryDesc: string;
  joinCauseTitle: string;
  joinCauseSub: string;
  joinDonorTitle: string;
  joinDonorDesc: string;
  joinVolunteerTitle: string;
  joinVolunteerDesc: string;
  joinFundTitle: string;
  joinFundDesc: string;
  getInTouchTitle: string;
  emailLabel: string;
  followUsLabel: string;
  closingMotto: string;
  backToHome: string;
}

export const STRINGS: Record<Lang, Strings> = {
  bn: {
    about: "আমাদের সম্পর্কে",
    contact: "যোগাযোগ",
    advice: "আপনার পরামর্শ",
    login: "লগইন",
    logout: "লগআউট",
    dashboard: "ড্যাশবোর্ড",
    aboutText:
      "জীবনবিন্দু ফাউন্ডেশন একটি স্বেচ্ছাসেবী রক্তদান সংগঠন। আমরা রক্তের প্রয়োজনে থাকা রোগী ও রক্তদাতাদের মধ্যে সেতুবন্ধন তৈরি করি।",
    contactText:
      "রক্তের প্রয়োজনে বা অন্য যেকোনো বিষয়ে আমাদের সাথে যোগাযোগ করুন।",
    contactPhone: "ফোন: +880 1XXX-XXXXXX",
    contactEmail: "ইমেইল: info@example.org",    
    ourAchievement: "আমাদের অর্জন",
    totalDonation: "মোট রক্তদান",
    totalCase: "মোট কেস",
    totalDonor: "মোট রক্তদাতা",
    totalMember: "মোট সদস্য",

    // Question Section Bangla
    getStartedHeading: "আমরা কীভাবে আপনাকে সাহায্য করতে পারি?",
    qNeedBlood: "আপনার কি রক্তের প্রয়োজন?",
    qNeedBloodSub: "জরুরি রক্তের জন্য দ্রুত আবেদন করুন এবং রক্তদাতার সাহায্য নিন।",
    qDonateBlood: "আপনি কি রক্তদান করতে চান?",
    qDonateBloodSub: "স্বেচ্ছায় রক্তদাতা হিসেবে নিবন্ধন করে অন্যের জীবন বাঁচাতে এগিয়ে আসুন।",
    qJoinFamily: "আমাদের জীবনবিন্দু পরিবারে যোগ দিতে চান?",
    qJoinFamilySub: "স্বেচ্ছাসেবক বা সক্রিয় সদস্য হিসেবে আমাদের দলে যোগদান করুন।",
    qFinancialAid: "আপনি কি আর্থিক সহায়তা প্রদান করতে চান?",
    qFinancialAidSub: "রোগীদের জরুরি চিকিৎসায় আমাদের ফান্ডে অর্থ সহায়তা প্রদান করুন।",

    // Eligibility Checker Bangla
    eligibilityTitle: "আমি কি আজ রক্ত দিতে পারি?",
    eligibilitySub:
      "জাতীয় ও বিশ্ব স্বাস্থ্য সংস্থার রক্ত পরিসঞ্চালন মানদণ্ড অনুযায়ী ৪টি দ্রুত স্বাস্থ্য প্রশ্নের উত্তর দিয়ে আপনার উপযুক্ততা যাচাই করুন।",
    resetQuestions: "প্রশ্ন রিসেট করুন",
    critAgeTitle: "১. বয়স (১৮ - ৬৫ বছর)",
    critAgeDesc: "আপনার বয়স কি বর্তমানে ১৮ থেকে ৬৫ বছরের মধ্যে?",
    critWeightTitle: "২. ওজন (≥ ৫০ কেজি)",
    critWeightDesc: "আপনার শরীরের ওজন কি অন্তত ৫০ কেজি (১১০ পাউন্ড)?",
    critIntervalTitle: "৩. বিরতি (৯০+ দিন)",
    critIntervalDesc: "আপনার সর্বশেষ রক্তদানের পর কি অন্তত ৩ মাস (৯০ দিন) অতিক্রান্ত হয়েছে?",
    critHealthTitle: "৪. সুস্থ শারীরিক অবস্থা",
    critHealthDesc: "আপনি কি আজ জ্বর, সর্দি ও অ্যান্টিবায়োটিক সেবনমুক্ত আছেন?",
    btnYes: "হ্যাঁ",
    btnNo: "না",
    eligibleBannerTitle: "অভিনন্দন! আপনি রক্তদানে সম্পূর্ণ উপযুক্ত!",
    eligibleBannerDesc:
      "আপনার উত্তরসমূহ জাতীয় ট্রান্সফিউশন নীতিমালার সাথে মিলেছে। আপনার এক ব্যাগ রক্ত ৩ জনের জীবন বাঁচাতে পারে।",
    viewEmergencyReq: "জরুরি আবেদন দেখুন",
    ineligibleBannerTitle: "দুঃখিত, আপনি সাময়িকভাবে রক্তদানে উপযুক্ত নন",
    ineligibleBannerDesc:
      "আপনার শারীরিক সুরক্ষা ও রোগীর নিরাপত্তার জন্য স্বাস্থ্যবিধি অনুসারে নির্দিষ্ট সময় পর অনুগ্রহ করে পুনরায় চেষ্টা করুন।",

    // Dedicated About & Read More (Bangla)
    readMore: "আরও জানুন",
    aboutShortDesc:
      "জীবনবিন্দু ফাউন্ডেশনে আমরা বিশ্বাস করি যে মানবতার শ্রেষ্ঠ কাজ হলো একটি প্রাণ রক্ষা করা। রক্তের অভাবে যাতে কোনো মুমূর্ষু রোগী কষ্ট না পায় বা প্রাণ না হারায়—এই একনিষ্ঠ লক্ষ্য নিয়ে পরিচালিত একটি অলাভজনক স্বেচ্ছাসেবী সংগঠন। 'এক বিন্দু রক্ত, এক প্রাণের স্পন্দন'—এই মূলমন্ত্রকে ধারণ করে আমরা স্বেচ্ছাসেবী রক্তদাতা ও সংকটাপন্ন রোগীদের মাঝে দূরত্ব ঘোচাতে নিরলস কাজ করে যাচ্ছি।",
    aboutTagline: "এক বিন্দু রক্ত, এক প্রাণের স্পন্দন",
    aboutMissionTitle: "আমাদের লক্ষ্য (Our Mission)",
    aboutMissionDesc:
      "আমাদের লক্ষ্য সুস্পষ্ট ও অত্যন্ত মানবিক: সংকটাপন্ন রোগীদের জরুরি মুহূর্তে সম্পূর্ণ বিনামূল্যে নিরাপদ রক্ত সরবরাহ নিশ্চিত করা। একই সাথে এমন একটি সহানুভূতিশীল সমাজ ও রক্তদাতা-স্বেচ্ছাসেবক নেটওয়ার্ক গড়ে তোলা, যারা যেকোনো চিকিৎসাজনিত জরুরি প্রয়োজনে দ্রুত সাড়া দিতে প্রস্তুত।",
    aboutDifferentTitle: "আমরা কীভাবে আলাদা (How We Are Different)",
    diffFreeTitle: "রোগী ও পরিবারের জন্য ১০০% বিনামূল্যে",
    diffFreeDesc:
      "চিকিৎসার জরুরি সময়ে পরিবার যে অসহনীয় মানসিক ও আর্থিক চাপে থাকে, তা আমরা হৃদয় দিয়ে উপলব্ধি করি। রক্তগ্রহীতাদের কাছ থেকে আমরা কোনো অবস্থাতেই একটি পয়সাও গ্রহণ বা দাবি করি না। আর্থিক অনটন যেন কখনোই জীবন বাঁচানোর অন্তরায় না হয়, তা নিশ্চিত করাই আমাদের সেবা।",
    diffFundTitle: "রক্তদাতার সম্পূর্ণ খরচ বহন",
    diffFundDesc:
      "রক্তদানের প্রক্রিয়ায় যাতায়াত ও আনুষঙ্গিক লজিস্টিক খরচের সম্পূর্ণ দায়ভার জীবনবিন্দু ফাউন্ডেশন নিজস্ব তহবিল থেকে বহন করে। রক্তদাতারা তাদের অমূল্য রক্ত দান করেন, তাই নিজেদের পকেট থেকে অর্থ খরচ করার কোনো প্রয়োজন তাদের নেই।",
    diffHealthTitle: "রক্তদাতার স্বাস্থ্য ও সুরক্ষায় আপসহীন",
    diffHealthDesc:
      "আমাদের রক্তদাতারা আমাদের আসল নায়ক, আর তাদের সার্বিক সুস্থতা আমাদের সর্বোচ্চ অগ্রাধিকার। রক্তদানের সময় প্রতিটি দাতার সুরক্ষা, আরাম এবং সঠিক পরিচর্যা নিশ্চিত করার জন্য আমরা সামগ্রিক ব্যবস্থা গ্রহণ করি এবং রক্তদানের পরও তাদের খোঁজখবর রাখি।",
    aboutStoryTitle: "আমাদের গল্প (Our Story)",
    aboutStoryDesc:
      "একটি ছোট্ট মানবিক উদ্যোগ হিসেবে শুরু হয়ে আজ জীবনবিন্দু নিবেদিতপ্রাণ স্বেচ্ছাসেবক ও রক্তদাতাদের এক বিশাল পরিবারে পরিণত হয়েছে। আমাদের দৈনন্দিন কর্মকাণ্ড ও সমাজসেবার মাধ্যমে প্রমাণিত হয়েছে—জীবনবিন্দু কেবল একটি সংস্থা নয়, এটি এক পরম সহানুভূতির আন্দোলন। গভীর রাতে জরুরি রক্তের ব্যবস্থা করা হোক কিংবা জনসচেতনতামূলক ক্যাম্পেইন, রক্তের এক একটি ফোঁটা দিয়ে জীবন বাঁচাতে আমাদের পুরো পরিবার সদা জাগ্রত।",
    joinCauseTitle: "এই মহৎ উদ্যোগে শামিল হোন (Join the Cause)",
    joinCauseSub:
      "যেহেতু আমরা রক্তদাতাদের সকল খরচ নিজস্ব তহবিল থেকে পরিচালনা করি, তাই আমরা আমাদের সমাজের উদারতা ও সহযোগিতার ওপর গভীরভাবে আস্থাশীল। আপনিও পারেন জীবনবিন্দু পরিবারের অংশ হতে:",
    joinDonorTitle: "রক্তদাতা হিসেবে নিবন্ধন করুন",
    joinDonorDesc:
      "জরুরি রক্তের প্রয়োজনে ডাক পেতে আমাদের সাথে স্বেচ্ছাসেবী রক্তদাতা হিসেবে যুক্ত থাকুন।",
    joinVolunteerTitle: "স্বেচ্ছাসেবক হিসেবে যোগ দিন",
    joinVolunteerDesc:
      "জরুরি পরিস্থিতি সমন্বয় এবং রক্তদাতাদের সহায়তায় আমাদের নিবেদিত মাঠপর্যায়ের দলের সদস্য হোন।",
    joinFundTitle: "তহবিলে অনুদান দিয়ে পাশে দাঁড়ান",
    joinFundDesc:
      "রোগীদের জন্য সেবা ১০০% বিনামূল্যে রাখতে এবং রক্তদাতাদের সহায়তা নির্বিঘ্ন করতে আমাদের অপারেশনাল ফান্ডে অনুদান প্রদান করুন।",
    getInTouchTitle: "যোগাযোগ করুন (Get in Touch)",
    emailLabel: "ইমেইল: info.jibonbindu@gmail.com",
    followUsLabel:
      "আমাদের অনুসরণ করুন: প্রতিদিনের জীবনরক্ষাকারী মানবিক কার্যক্রম দেখতে আমাদের ফেসবুক পেজে যুক্ত থাকুন।",
    closingMotto:
      "একসাথে মিলে আমরা নিশ্চিত করতে পারি—রক্তের প্রতিটি বিন্দুই যেন পৃথিবীতে একটি নতুন হৃদস্পন্দন জাগিয়ে তোলে।",
    backToHome: "হোমে ফিরে যান",
  },
  en: {
    about: "About",
    contact: "Contact",
    advice: "Your Advice",
    login: "Login",
    logout: "Log out",
    dashboard: "Dashboard",
    aboutText:
      "Jibonbindu Foundation is a voluntary blood donation platform bridging the gap between donors and patients across Bangladesh.",
    contactText:
      "Reach out to request blood, join our volunteer network, or ask questions.",
    contactPhone: "Phone: +880 1XXX-XXXXXX",
    contactEmail: "Email: info@example.org",
    ourAchievement: "Our Achievement",
    totalDonation: "Total Donations",
    totalCase: "Total Cases",
    totalDonor: "Total Donors",
    totalMember: "Total Members",

    // Question Section English
    getStartedHeading: "How Can We Help You Today?",
    qNeedBlood: "Do you need blood?",
    qNeedBloodSub: "Post an emergency blood request for a patient in need.",
    qDonateBlood: "Do you want to donate blood?",
    qDonateBloodSub: "Register as a volunteer donor and save lives in your area.",
    qJoinFamily: "Do you want to join in our JibonBindu Family?",
    qJoinFamilySub: "Become an active volunteer member of our foundation team.",
    qFinancialAid: "Would you like to provide financial assistance?",
    qFinancialAidSub: "Support our foundation and emergency patient fund.",

    // Eligibility Checker English
    eligibilityTitle: "Can I Donate Blood Today?",
    eligibilitySub:
      "Check your eligibility in 30 seconds by answering 4 quick questions based on WHO & National blood transfusion guidelines.",
    resetQuestions: "Reset Questions",
    critAgeTitle: "1. Age (18 - 65 Years)",
    critAgeDesc: "Is your current age between 18 and 65 years?",
    critWeightTitle: "2. Weight (≥ 50 kg)",
    critWeightDesc: "Is your body weight at least 50 kg (110 lbs)?",
    critIntervalTitle: "3. Interval (90+ Days)",
    critIntervalDesc: "Has it been at least 3 months (90 days) since your last blood donation?",
    critHealthTitle: "4. Healthy Condition",
    critHealthDesc: "Are you feeling completely well today and free of fever, cold, or antibiotics?",
    btnYes: "Yes",
    btnNo: "No",
    eligibleBannerTitle: "Congratulations! You are fully eligible to donate blood!",
    eligibleBannerDesc:
      "Your answers comply with national transfusion safety standards. One donation can save up to 3 lives.",
    viewEmergencyReq: "View Emergency Requests",
    ineligibleBannerTitle: "Sorry, you are temporarily ineligible to donate blood",
    ineligibleBannerDesc:
      "For your well-being and patient safety, please wait for the required recovery period before trying again.",

    // Dedicated About & Read More (English)
    readMore: "Read More",
    aboutShortDesc:
      "At Jibonbindu Foundation, we believe that humanity’s greatest act is saving a life. We are a dedicated, non-profit organization driven by a single, powerful purpose: ensuring that no emergency patient suffers or loses their life due to a lack of blood. Guided by our core belief—\"এক বিন্দু রক্ত, এক প্রাণের স্পন্দন\" (One drop of blood, the pulse of a life)—we work tirelessly to bridge the gap between voluntary blood donors and critically ill patients who need immediate help.",
    aboutTagline: "One drop of blood, the pulse of a life",
    aboutMissionTitle: "Our Mission",
    aboutMissionDesc:
      "Our mission is simple yet vital: to provide safe, emergency blood to those in critical condition, completely free of charge. We strive to build a strong, compassionate community of donors and volunteers who are always ready to respond to medical emergencies.",
    aboutDifferentTitle: "How We Are Different",
    diffFreeTitle: "100% Free for Seekers",
    diffFreeDesc:
      "We understand the extreme stress families face during medical emergencies. We never accept or ask for a single penny from those seeking blood. Our services are entirely free, ensuring that financial hardship never stands in the way of a life-saving transfusion.",
    diffFundTitle: "Fully Funded Donor Support",
    diffFundDesc:
      "We bear all the costs associated with the blood donation process from our own foundation funds. Donors give their invaluable blood, and we ensure they do not have to spend their own money on transportation or related logistical expenses to do so.",
    diffHealthTitle: "Uncompromising Donor Health & Safety",
    diffHealthDesc:
      "Our donors are our heroes, and their well-being is our top priority. We take comprehensive measures to ensure that every donor is safe, comfortable, and properly cared for during the process, and we follow up to ensure they remain healthy after donating.",
    aboutStoryTitle: "Our Story",
    aboutStoryDesc:
      "What started as a small initiative has grown into a widespread family of selfless volunteers and donors. As seen in our everyday activities and community gatherings, Jibonbindu is more than just an organization; it is a movement of empathy. Whether we are arranging an urgent blood match in the middle of the night or organizing donor awareness events, our community stands united by the inspiration of valuable time and selfless blood donation.",
    joinCauseTitle: "Join the Cause",
    joinCauseSub:
      "Because we cover all donor expenses from our own foundation, we rely on the generosity and spirit of our community. There are many ways you can be a part of the Jibonbindu family:",
    joinDonorTitle: "Become a Donor",
    joinDonorDesc:
      "Register with us to be called upon when someone urgently needs your blood type.",
    joinVolunteerTitle: "Volunteer",
    joinVolunteerDesc:
      "Join our active team on the ground to help coordinate emergencies and support our donors.",
    joinFundTitle: "Support Our Fund",
    joinFundDesc:
      "Help us keep our services 100% free for patients and fully covered for donors by contributing to our operational fund.",
    getInTouchTitle: "Get in Touch",
    emailLabel: "Email: info.jibonbindu@gmail.com",
    followUsLabel:
      "Follow Us: Connect with us on our Facebook page to see our daily impact and join our growing community of lifesavers.",
    closingMotto:
      "Together, we can ensure that every drop of blood brings a new heartbeat to the world.",
    backToHome: "Back to Home",
  },
};