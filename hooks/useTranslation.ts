'use client'

import { useTranslation as useI18nTranslation } from '@/lib/i18n-provider'

// Re-export the hook with a shorter name for convenience
export const useTranslation = useI18nTranslation

// Helper hook for specific translation sections
export const useNavbarTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    home: t('navbar.home'),
    about: t('navbar.about'),
    partner: t('navbar.partner'),
    releases: t('navbar.releases'),
    myMovies: t('navbar.myMovies'),
    login: t('navbar.login'),
    logout: t('navbar.logout'),
    loggingOut: t('navbar.loggingOut'),
  }
}

export const useAuthTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    login: t('auth.login'),
    register: t('auth.register'),
    logout: t('auth.logout'),
    email: t('auth.email'),
    password: t('auth.password'),
    confirmPassword: t('auth.confirmPassword'),
    name: t('auth.name'),
    welcomeBack: t('auth.welcomeBack'),
    createAccount: t('auth.createAccount'),
    forgotPassword: t('auth.forgotPassword'),
    invalidCredentials: t('auth.invalidCredentials'),
    loginError: t('auth.loginError'),
    passwordMismatch: t('auth.passwordMismatch'),
    passwordMinLength: t('auth.passwordMinLength'),
    registerError: t('auth.registerError'),
    alreadyHaveAccount: t('auth.alreadyHaveAccount'),
    dontHaveAccount: t('auth.dontHaveAccount'),
    signIn: t('auth.signIn'),
    signUp: t('auth.signUp'),
    loveIsLove: t('auth.loveIsLove'),
    createdWithLove: t('auth.createdWithLove'),
    diversityInclusionLove: t('auth.diversityInclusionLove'),
    createAccountAndJoin: t('auth.createAccountAndJoin'),
    celebratingLove: t('auth.celebratingLove'),
    joinTheFamily: t('auth.joinTheFamily'),
    createMyAccount: t('auth.createMyAccount'),
    alreadyPartOfFamily: t('auth.alreadyPartOfFamily'),
    makeLogin: t('auth.makeLogin'),
    fullName: t('auth.fullName'),
    fullNamePlaceholder: t('auth.fullNamePlaceholder'),
    emailPlaceholder: t('auth.emailPlaceholder'),
    passwordPlaceholder: t('auth.passwordPlaceholder'),
    confirmPasswordPlaceholder: t('auth.confirmPasswordPlaceholder'),
    creatingAccount: t('auth.creatingAccount'),
    loginEmailPlaceholder: t('auth.loginEmailPlaceholder'),
    loginPasswordPlaceholder: t('auth.loginPasswordPlaceholder'),
  }
}

export const useMoviesTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    title: t('movies.title'),
    genres: t('movies.genres'),
    duration: t('movies.duration'),
    rating: t('movies.rating'),
    releaseDate: t('movies.releaseDate'),
    director: t('movies.director'),
    cast: t('movies.cast'),
    synopsis: t('movies.synopsis'),
    watchNow: t('movies.watchNow'),
    addToList: t('movies.addToList'),
    rent: t('movies.rent'),
    buy: t('movies.buy'),
    purchased: t('movies.purchased'),
    watchTrailer: t('movies.watchTrailer'),
    addNewMovie: t('movies.addNewMovie'),
    premium: t('movies.premium'),
  }
}

export const useCommonTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    loading: t('common.loading'),
    error: t('common.error'),
    success: t('common.success'),
    cancel: t('common.cancel'),
    confirm: t('common.confirm'),
    save: t('common.save'),
    delete: t('common.delete'),
    edit: t('common.edit'),
    close: t('common.close'),
    backToHome: t('common.backToHome'),
    tryAgain: t('common.tryAgain'),
  }
}

export const useAboutTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    title: t('about.title'),
    ourStory: t('about.ourStory'),
    mission: t('about.mission'),
    awards: t('about.awards'),
    filmography: t('about.filmography'),
    watchTrailer: t('about.watchTrailer'),
    year: t('about.year'),
    genre: t('about.genre'),
    duration: t('about.duration'),
    description: t('about.description'),
    heroTitle: t('about.heroTitle'),
    heroSubtitle: t('about.heroSubtitle'),
    heroQuote: t('about.heroQuote'),
    ourMissionTitle: t('about.ourMissionTitle'),
    missionText1: t('about.missionText1'),
    missionText2: t('about.missionText2'),
    missionText3: t('about.missionText3'),
    missionText4: t('about.missionText4'),
    love: t('about.love'),
    unity: t('about.unity'),
    freedom: t('about.freedom'),
    ourVisionTitle: t('about.ourVisionTitle'),
    visionText1: t('about.visionText1'),
    visionText2: t('about.visionText2'),
    visionText3: t('about.visionText3'),
    filmographyTitle: t('about.filmographyTitle'),
    recognitionTitle: t('about.recognitionTitle'),
    directorBioTitle: t('about.directorBioTitle'),
    directorName: t('about.directorName'),
    bornIn: t('about.bornIn'),
    graduated: t('about.graduated'),
    bioText: t('about.bioText'),
    directorProducer: t('about.directorProducer'),
    joinJourneyTitle: t('about.joinJourneyTitle'),
    joinJourneyText: t('about.joinJourneyText'),
    exploreFilms: t('about.exploreFilms'),
    contactUs: t('about.contactUs'),
    premiere: t('about.premiere'),
    exploringThemes: t('about.exploringThemes'),
    visionaryTale: t('about.visionaryTale'),
    intimateJourney: t('about.intimateJourney'),
    celebratingIdentity: t('about.celebratingIdentity'),
    historicalPerspective: t('about.historicalPerspective'),
  }
}

export const useHomeTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    featuredMovies: t('home.featuredMovies'),
    newReleases: t('home.newReleases'),
    trending: t('home.trending'),
    welcomeMessage: t('home.welcomeMessage'),
    subtitle: t('home.subtitle'),
  }
}

export const usePartnerTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    title: t('partner.title'),
    subtitle: t('partner.subtitle'),
    benefits: t('partner.benefits'),
    contact: t('partner.contact'),
    heroTitle: t('partner.heroTitle'),
    heroSubtitle: t('partner.heroSubtitle'),
    heroText: t('partner.heroText'),
    partnershipVisionTitle: t('partner.partnershipVisionTitle'),
    visionText1: t('partner.visionText1'),
    visionText2: t('partner.visionText2'),
    visionText3: t('partner.visionText3'),
    visionText4: t('partner.visionText4'),
    visionText5: t('partner.visionText5'),
    visionText6: t('partner.visionText6'),
    yourFilmMatters: t('partner.yourFilmMatters'),
    filmMattersText1: t('partner.filmMattersText1'),
    filmMattersText2: t('partner.filmMattersText2'),
    filmMattersText3: t('partner.filmMattersText3'),
    whyPartnerTitle: t('partner.whyPartnerTitle'),
    creativeFreedom: t('partner.creativeFreedom'),
    creativeFreedomDesc: t('partner.creativeFreedomDesc'),
    globalAudience: t('partner.globalAudience'),
    globalAudienceDesc: t('partner.globalAudienceDesc'),
    festivalNetwork: t('partner.festivalNetwork'),
    festivalNetworkDesc: t('partner.festivalNetworkDesc'),
    passionateCommunity: t('partner.passionateCommunity'),
    passionateCommunityDesc: t('partner.passionateCommunityDesc'),
    partnershipInAction: t('partner.partnershipInAction'),
    behindScenes: t('partner.behindScenes'),
    behindScenesDesc: t('partner.behindScenesDesc'),
    festivalMoments: t('partner.festivalMoments'),
    festivalMomentsDesc: t('partner.festivalMomentsDesc'),
    communityEvents: t('partner.communityEvents'),
    communityEventsDesc: t('partner.communityEventsDesc'),
    artisticVision: t('partner.artisticVision'),
    artisticVisionDesc: t('partner.artisticVisionDesc'),
    collaboration: t('partner.collaboration'),
    collaborationDesc: t('partner.collaborationDesc'),
    joinCommunityText: t('partner.joinCommunityText'),
    letsCollaborate: t('partner.letsCollaborate'),
    contactToCollaborate: t('partner.contactToCollaborate'),
    email: t('partner.email'),
    phone: t('partner.phone'),
    readyToStart: t('partner.readyToStart'),
    readyToStartText: t('partner.readyToStartText'),
    partnershipInquiry: t('partner.partnershipInquiry'),
    name: t('partner.name'),
    filmTitle: t('partner.filmTitle'),
    genre: t('partner.genre'),
    genrePlaceholder: t('partner.genrePlaceholder'),
    budgetRange: t('partner.budgetRange'),
    budgetPlaceholder: t('partner.budgetPlaceholder'),
    projectDescription: t('partner.projectDescription'),
    projectDescriptionPlaceholder: t('partner.projectDescriptionPlaceholder'),
    timeline: t('partner.timeline'),
    timelinePlaceholder: t('partner.timelinePlaceholder'),
    sendInquiry: t('partner.sendInquiry'),
    readyToChangeWorld: t('partner.readyToChangeWorld'),
    readyToChangeWorldText: t('partner.readyToChangeWorldText'),
    whyPartnerWithUs: t('partner.whyPartnerWithUs'),
    partnershipInActionTitle: t('partner.partnershipInActionTitle'),
    sendingInquiry: t('partner.sendingInquiry'),
    inquirySentSuccess: t('partner.inquirySentSuccess'),
    inquiryError: t('partner.inquiryError'),
    fillRequiredFields: t('partner.fillRequiredFields'),
  }
}

export const useReleasesTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    title: t('releases.title'),
    latest: t('releases.latest'),
    comingSoon: t('releases.comingSoon'),
  }
}

export const usePaymentTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    success: t('payment.success'),
    processing: t('payment.processing'),
    failed: t('payment.failed'),
    total: t('payment.total'),
    payNow: t('payment.payNow'),
    processingPayment: t('payment.processingPayment'),
    waitWhileWeConfirm: t('payment.waitWhileWeConfirm'),
    paymentError: t('payment.paymentError'),
    paymentApproved: t('payment.paymentApproved'),
    filmAcquiredSuccess: t('payment.filmAcquiredSuccess'),
    redirectingInSeconds: t('payment.redirectingInSeconds'),
    paypalPayment: t('payment.paypalPayment'),
    secureInstantPayment: t('payment.secureInstantPayment'),
    subtotal: t('payment.subtotal'),
    prideSupportFee: t('payment.prideSupportFee'),
    ssl256Encryption: t('payment.ssl256Encryption'),
    processedViaPaypal: t('payment.processedViaPaypal'),
    redirectMessage: t('payment.redirectMessage'),
    totalToPay: t('payment.totalToPay'),
    paypalEmail: t('payment.paypalEmail'),
    paypalEmailPlaceholder: t('payment.paypalEmailPlaceholder'),
    invalidEmailPaypal: t('payment.invalidEmailPaypal'),
    enterPaypalEmail: t('payment.enterPaypalEmail'),
    paypalBuyerProtection: t('payment.paypalBuyerProtection'),
    securePayment100: t('payment.securePayment100'),
    securePaymentNotice: t('payment.securePaymentNotice'),
    militaryEncryption: t('payment.militaryEncryption'),
    supportDiverseContent: t('payment.supportDiverseContent'),
    redirectingToPaypal: t('payment.redirectingToPaypal'),
    payWithPaypal: t('payment.payWithPaypal'),
    paypalAdvantages: t('payment.paypalAdvantages'),
    totalBuyerProtection: t('payment.totalBuyerProtection'),
    noShareBankData: t('payment.noShareBankData'),
    instantPayment: t('payment.instantPayment'),
    support24x7: t('payment.support24x7'),
    thankYouSupport: t('payment.thankYouSupport'),
  }
}

export const useUserTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    profile: t('user.profile'),
    myMovies: t('user.myMovies'),
    settings: t('user.settings'),
    purchaseHistory: t('user.purchaseHistory'),
  }
}

export const useUserProfileTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    loading: t('userProfile.loading'),
    loadError: t('userProfile.loadError'),
    userNotFound: t('userProfile.userNotFound'),
    errorLoadingData: t('userProfile.errorLoadingData'),
    memberSince: t('userProfile.memberSince'),
    administrator: t('userProfile.administrator'),
    premiumMember: t('userProfile.premiumMember'),
    prideMessage: t('userProfile.prideMessage'),
    stats: {
      filmsAcquired: t('userProfile.stats.filmsAcquired'),
      totalInvested: t('userProfile.stats.totalInvested'),
      averageRating: t('userProfile.stats.averageRating'),
      contentTime: t('userProfile.stats.contentTime')
    },
    collection: {
      title: t('userProfile.collection.title'),
      subtitle: t('userProfile.collection.subtitle'),
      filmCount: t('userProfile.collection.filmCount'),
      filmsCount: t('userProfile.collection.filmsCount'),
      owned: t('userProfile.collection.owned'),
      noFilms: t('userProfile.collection.noFilms'),
      noFilmsDescription: t('userProfile.collection.noFilmsDescription'),
      exploreFilms: t('userProfile.collection.exploreFilms')
    },
    footerMessage: t('userProfile.footerMessage')
  }
}

export const useMyMoviesTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    title: t('myMovies.title'),
    loading: t('myMovies.loading'),
    filmCount: {
      singular: t('myMovies.filmCount.singular'),
      plural: t('myMovies.filmCount.plural')
    },
    noFilms: t('myMovies.noFilms'),
    empty: {
      title: t('myMovies.empty.title'),
      description: t('myMovies.empty.description'),
      exploreButton: t('myMovies.empty.exploreButton')
    },
    playButton: t('myMovies.playButton'),
    viewDetails: t('myMovies.viewDetails')
  }
}
