/**
 * Shared i18n strings for all account pages.
 * German (de) is the default locale, English (en) is the fallback.
 */
export const accountI18n = {
  de: {
    // Sidebar / shared
    myAccount: 'Mein Konto',
    overview: 'Übersicht',
    orders: 'Bestellungen',
    myLearning: 'Meine Kurse',
    settings: 'Einstellungen',
    profile: 'Profil',
    addresses: 'Adressen',
    shipping: 'Versand',
    signOut: 'Abmelden',

    // Dashboard
    welcomeBack: (name: string) => `Willkommen zurück, ${name}.`,
    dashboardSubtitle: 'Bestellungen ansehen, Adressen verwalten und Kontodaten bearbeiten.',
    viewOrders: 'Bestellungen',
    editProfile: 'Profil bearbeiten',
    totalOrders: 'Bestellungen',
    processing: 'In Bearbeitung',
    delivered: 'Geliefert',
    memberSince: 'Mitglied seit',
    viewAll: 'Alle ansehen',
    courseEnrolled: (n: number) =>
      n === 1 ? '1 Kurs eingeschrieben' : `${n} Kurse eingeschrieben`,
    pickUp: 'Dort weitermachen, wo du aufgehört hast',
    continue: 'Weiter',
    recentOrders: 'Letzte Bestellungen',
    order: 'Bestellung',
    date: 'Datum',
    status: 'Status',
    total: 'Gesamt',
    view: 'Ansehen',
    noOrders: 'Noch keine Bestellungen.',
    exploreWorkshops: 'Workshops entdecken',
    statusDelivered: 'Geliefert',
    statusProcessing: 'In Bearbeitung',
    statusPending: 'Ausstehend',
    statusConfirmed: 'Bestätigt',
    statusCompleted: 'Abgeschlossen',
    statusCancelled: 'Storniert',
    statusRefunded: 'Erstattet',
    noShippingNeeded: 'Kein Versand erforderlich – digitale Inhalte oder Workshop-Tickets.',
    pickupAtStudio: 'Abholung im Studio – wir senden dir die Abholdetails per E-Mail.',

    // Profile
    accountDetails: 'Kontodaten',
    profileSubtitle: 'Persönliche Informationen und Sicherheitseinstellungen verwalten.',
    fullName: 'Vollständiger Name',
    emailAddress: 'E-Mail-Adresse',
    saveChanges: 'Änderungen speichern',
    saving: 'Speichern…',
    security: 'Sicherheit',
    password: 'Passwort',
    change: 'Ändern',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    confirmPassword: 'Passwort bestätigen',
    updatePassword: 'Passwort aktualisieren',
    updating: 'Aktualisieren…',
    cancel: 'Abbrechen',
    accountStatus: 'Kontostatus',
    accountActive: 'Konto ist aktiv und verifiziert',
    minChars: 'Mindestens 8 Zeichen',
    profileUpdated: 'Profil aktualisiert',
    profileUpdateFailed: 'Profil konnte nicht aktualisiert werden',
    passwordUpdated: 'Passwort aktualisiert',
    passwordUpdateFailed: 'Passwort konnte nicht aktualisiert werden',
    passwordsNoMatch: 'Passwörter stimmen nicht überein',
    passwordTooShort: 'Passwort muss mindestens 8 Zeichen lang sein',
    somethingWrong: 'Etwas ist schiefgelaufen',
    yourFullName: 'Dein vollständiger Name',

    // Orders
    ordersSubtitle: (n: number) =>
      n > 0
        ? `${n} Bestellung${n !== 1 ? 'en' : ''} in deinem Verlauf`
        : 'Dein Bestellverlauf erscheint hier.',
    items: 'Artikel',

    // Order detail
    allOrders: 'Alle Bestellungen',
    orderDate: 'Bestelldatum',
    shippingAddress: 'Lieferadresse',
    itemUnavailable: 'Dieser Artikel ist nicht mehr verfügbar.',

    // Addresses
    manageAddresses: 'Versand- und Rechnungsadressen verwalten.',
    addAddress: 'Adresse hinzufügen',
    edit: 'Bearbeiten',
    noAddresses: 'Noch keine Adressen gespeichert.',
    addFirstAddress: 'Erste Adresse hinzufügen',

    // Shipping methods
    shippingMethods: 'Versandmethoden',
    shippingSubtitle: 'Verfügbare Lieferoptionen für deine Bestellungen.',
    shippingInfo:
      'Die Versandmethode wird beim Checkout basierend auf deinem Standort und deinen Präferenzen ausgewählt. Optionen und Preise können für Workshop-Materialien und Online-Produkte variieren.',
    availableOptions: 'Verfügbare Optionen',
    standardShipping: 'Standardversand',
    standardDesc: 'Sendungsverfolgung via DHL',
    standardDuration: '3–5 Werktage',
    expressShipping: 'Expressversand',
    expressDesc: 'Prioritätsversand via DHL',
    expressDuration: '1–2 Werktage',
    freeOver: (amount: string) => `Kostenlos ab ${amount}`,
    notes: 'Hinweise',
    noteDeliveryTimes: 'Lieferzeiten sind Schätzungen und können in Stoßzeiten variieren.',
    noteDigitalTickets: 'Workshop-Tickets sind digital — kein Versand erforderlich.',
    notePhysicalKits: 'Physische Kits und Bücher werden separat versendet.',
    noteTracking: 'Sendungsverfolgung wird per E-Mail zugestellt.',

    // Learning
    learningSubtitle: 'Deine Online-Kurse und Fortschritte. Mach weiter, wo du aufgehört hast.',
    noCourses: 'Noch keine Kurse',
    noCoursesDesc:
      'Kaufe einen Online-Kurs, um ihn hier zu sehen und deinen Fortschritt zu verfolgen.',
    browseCourses: 'Kurse durchsuchen',
    onlineCourse: 'Online-Kurs',
    startCourse: 'Kurs starten',
    reviewCourse: 'Kurs wiederholen',
    continueCourse: 'Fortsetzen',
    lessonsCompleted: (completed: number, total: number) =>
      `${completed} / ${total} Lektionen abgeschlossen`,
    complete: 'Abgeschlossen',

    // Order confirmation
    welcomeToCourse: 'Willkommen zu deinem Kurs!',
    courseConfirmDesc:
      'Dein Kauf ist bestätigt und dein Kurs ist sofort verfügbar — kein Warten, kein Versand.',
    orderInfo: 'Bestellinformationen',
    orderNumber: 'Bestellnummer',
    access: 'Zugang',
    lifetimeAccess: 'Lebenslang — sofortiger Zugang',
    whatsNext: 'Nächste Schritte',
    paymentConfirmed: 'Zahlung bestätigt',
    paymentConfirmedDesc:
      'Deine Zahlung wurde erfolgreich verarbeitet. Eine Quittung wurde an deine E-Mail gesendet.',
    youreEnrolled: 'Du bist eingeschrieben',
    enrolledDesc:
      'Dein Kurs wurde deinem Lern-Dashboard hinzugefügt. Alle Lektionen sind freigeschaltet.',
    startLearning: 'Lerne jetzt',
    startLearningDesc:
      'Gehe zu deinem Lern-Dashboard und beginne mit der ersten Lektion. Lerne in deinem eigenen Tempo.',
    goToLearning: 'Zu Meinen Kursen',
    browseMoreCourses: 'Weitere Kurse durchsuchen',
    questions: 'Fragen?',
    questionsDescCourse: 'Brauchst du Hilfe beim Einstieg? Unser Support-Team hilft dir gerne.',
    contactSupport: 'Support kontaktieren',
    thankYouOrder: 'Vielen Dank für deine Bestellung!',
    orderPlacedDesc:
      'Deine Bestellung wurde erfolgreich aufgegeben. Wir freuen uns, sie dir zu liefern!',
    emailConfirmation: 'E-Mail-Bestätigung',
    sentToInbox: 'An deinen Posteingang gesendet',
    orderConfirmed: 'Bestellung bestätigt',
    orderConfirmedDesc: 'Deine Zahlung wurde verarbeitet und deine Bestellung ist bestätigt',
    pickupDetails: 'Abholdetails',
    pickupDate: 'Abholdatum',
    pickupTime: 'Abholzeit',
    preparationPickup: 'Vorbereitung und Abholung',
    readyForPickup: 'Abholen',
    processingShipping: 'Verarbeitung & Versand',
    processingShippingDesc:
      'Wir bereiten deine Artikel vor und versenden innerhalb von 1-2 Werktagen',
    onTheWay: 'Unterwegs',
    onTheWayDesc: 'Du erhältst die Sendungsverfolgung per E-Mail',
    whatYouCanDo: 'Was du jetzt tun kannst',
    checkEmail: 'Prüfe deine E-Mail für eine Bestellbestätigung und Quittung',
    visitDashboard: 'Besuche dein Konto-Dashboard, um den Bestellstatus zu verfolgen',
    contactUs: 'Kontaktiere uns bei Fragen zu deiner Bestellung',
    viewMyOrders: 'Meine Bestellungen ansehen',
    continueShopping: 'Weiter einkaufen',
    questionsDescOrder: 'Unser Kundenservice ist für dich da. Melde dich jederzeit.',

    // Workshop confirmation
    workshopConfirmed: 'Dein Workshop-Platz ist reserviert!',
    workshopConfirmDesc: 'Deine Buchung ist bestätigt — wir freuen uns auf dich!',
    bookingConfirmed: 'Buchung bestätigt',
    bookingConfirmedDesc: 'Deine Zahlung wurde verarbeitet und dein Platz ist gesichert.',
    confirmationEmail: 'Bestätigungs-E-Mail',
    confirmationEmailDesc: 'Du erhältst eine E-Mail mit allen Workshop-Details und Anfahrt.',
    workshopDay: 'Am Workshop-Tag',
    workshopDayDesc:
      'Komm einfach pünktlich — wir kümmern uns um den Rest. Alle Materialien sind inklusive.',
    viewBookingDetails: 'Buchungsdetails ansehen',
    browseMoreWorkshops: 'Weitere Workshops',
    questionsDescWorkshop: 'Fragen zum Workshop? Unser Team hilft dir gerne weiter.',

    // Layout
    loginRequired: 'Bitte melde dich an, um auf dein Konto zuzugreifen.',
    loginRequiredOrders: 'Bitte melde dich an, um deine Bestellungen zu sehen.',
    loginRequiredAddresses: 'Bitte melde dich an, um deine Adressen zu verwalten.',

    // Downloads
    downloads: 'Downloads',
    downloadsSubtitle: 'Deine herunterladbaren Dateien und digitalen Produkte.',
    noDownloads: 'Noch keine Downloads verfügbar.',
    loginRequiredDownloads: 'Bitte melde dich an, um deine Downloads zu sehen.',

    // Purchases / Reviews
    purchases: 'Einkäufe',
    reviews: 'Bewertungen',
    reviewsSubtitle: 'Deine Produktbewertungen und Feedback.',
    noReviews: 'Noch keine Bewertungen abgegeben.',
    loginRequiredReviews: 'Bitte melde dich an, um deine Bewertungen zu sehen.',

    // Return Requests
    returnRequests: 'Rücksendungen',
    returnRequestsSubtitle: 'Rücksendeanträge und deren Status.',
    noReturnRequests: 'Keine Rücksendeanträge vorhanden.',
    loginRequiredReturnRequests: 'Bitte melde dich an, um deine Rücksendeanträge zu sehen.',

    // Cancellations
    cancellations: 'Stornierungen',
    cancellationsSubtitle: 'Stornierungsanträge und Erstattungen.',
    noCancellations: 'Keine Stornierungsanträge vorhanden.',
    loginRequiredCancellations: 'Bitte melde dich an, um deine Stornierungen zu sehen.',

    // Payment Methods
    paymentMethods: 'Zahlungsmethoden',
    paymentMethodsSubtitle: 'Gespeicherte Zahlungsmethoden verwalten.',
    noPaymentMethods: 'Keine Zahlungsmethoden gespeichert.',
    loginRequiredPaymentMethods: 'Bitte melde dich an, um deine Zahlungsmethoden zu sehen.',
  },
  en: {
    // Sidebar / shared
    myAccount: 'My Account',
    overview: 'Overview',
    orders: 'Orders',
    myLearning: 'My Learning',
    settings: 'Settings',
    profile: 'Profile',
    addresses: 'Addresses',
    shipping: 'Shipping',
    signOut: 'Sign out',

    // Dashboard
    welcomeBack: (name: string) => `Welcome back, ${name}.`,
    dashboardSubtitle: 'View your orders, manage your addresses, and update your account details.',
    viewOrders: 'View Orders',
    editProfile: 'Edit Profile',
    totalOrders: 'Total Orders',
    processing: 'Processing',
    delivered: 'Delivered',
    memberSince: 'Member Since',
    viewAll: 'View all',
    courseEnrolled: (n: number) => (n === 1 ? '1 course enrolled' : `${n} courses enrolled`),
    pickUp: 'Pick up where you left off',
    continue: 'Continue',
    recentOrders: 'Recent Orders',
    order: 'Order',
    date: 'Date',
    status: 'Status',
    total: 'Total',
    view: 'View',
    noOrders: 'No orders yet.',
    exploreWorkshops: 'Explore Workshops',
    statusDelivered: 'Delivered',
    statusProcessing: 'Processing',
    statusPending: 'Pending',
    statusConfirmed: 'Confirmed',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    statusRefunded: 'Refunded',
    noShippingNeeded: 'No shipping needed — digital content or workshop tickets.',
    pickupAtStudio: 'Studio pickup — we will email you the pickup details.',

    // Profile
    accountDetails: 'Account Details',
    profileSubtitle: 'Manage your personal information and security settings.',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    saveChanges: 'Save Changes',
    saving: 'Saving…',
    security: 'Security',
    password: 'Password',
    change: 'Change',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    updatePassword: 'Update Password',
    updating: 'Updating…',
    cancel: 'Cancel',
    accountStatus: 'Account Status',
    accountActive: 'Account is active and verified',
    minChars: 'Minimum 8 characters',
    profileUpdated: 'Profile updated',
    profileUpdateFailed: 'Failed to update profile',
    passwordUpdated: 'Password updated',
    passwordUpdateFailed: 'Failed to update password',
    passwordsNoMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 8 characters',
    somethingWrong: 'Something went wrong',
    yourFullName: 'Your full name',

    // Orders
    ordersSubtitle: (n: number) =>
      n > 0
        ? `${n} order${n !== 1 ? 's' : ''} in your history`
        : 'Your order history will appear here.',
    items: 'Items',

    // Order detail
    allOrders: 'All orders',
    orderDate: 'Order Date',
    shippingAddress: 'Shipping Address',
    itemUnavailable: 'This item is no longer available.',

    // Addresses
    manageAddresses: 'Manage your shipping and billing addresses.',
    addAddress: 'Add Address',
    edit: 'Edit',
    noAddresses: 'No addresses saved yet.',
    addFirstAddress: 'Add Your First Address',

    // Shipping methods
    shippingMethods: 'Shipping Methods',
    shippingSubtitle: 'Available delivery options for your orders.',
    shippingInfo:
      'Shipping method is selected at checkout based on your location and preferences. Options and pricing may vary for workshop materials versus online products.',
    availableOptions: 'Available Options',
    standardShipping: 'Standard Shipping',
    standardDesc: 'Tracked delivery via DHL',
    standardDuration: '3–5 business days',
    expressShipping: 'Express Shipping',
    expressDesc: 'Priority delivery via DHL',
    expressDuration: '1–2 business days',
    freeOver: (amount: string) => `Free for orders over ${amount}`,
    notes: 'Notes',
    noteDeliveryTimes: 'Delivery times are estimates and may vary during peak periods.',
    noteDigitalTickets: 'Workshop tickets are digital — no shipping required.',
    notePhysicalKits: 'Physical kits and books ship separately if ordered with tickets.',
    noteTracking: 'Tracking information is emailed once your order ships.',

    // Learning
    learningSubtitle: 'Your online courses and progress. Pick up where you left off.',
    noCourses: 'No courses yet',
    noCoursesDesc: 'Purchase an online course to access it here and track your progress.',
    browseCourses: 'Browse Courses',
    onlineCourse: 'Online Course',
    startCourse: 'Start Course',
    reviewCourse: 'Review Course',
    continueCourse: 'Continue',
    lessonsCompleted: (completed: number, total: number) =>
      `${completed} / ${total} lessons completed`,
    complete: 'Complete',

    // Order confirmation
    welcomeToCourse: 'Welcome to Your Course!',
    courseConfirmDesc:
      'Your purchase is confirmed and your course is ready to start — no waiting, no shipping.',
    orderInfo: 'Order Information',
    orderNumber: 'Order Number',
    access: 'Access',
    lifetimeAccess: 'Lifetime — instant access',
    whatsNext: "What's Next",
    paymentConfirmed: 'Payment Confirmed',
    paymentConfirmedDesc:
      'Your payment was processed successfully. A receipt has been sent to your email.',
    youreEnrolled: "You're Enrolled",
    enrolledDesc:
      'Your course has been added to your learning dashboard. All lessons are unlocked.',
    startLearning: 'Start Learning',
    startLearningDesc:
      'Head to your learning dashboard and start with the first lesson. Learn at your own pace.',
    goToLearning: 'Go to My Learning',
    browseMoreCourses: 'Browse More Courses',
    questions: 'Questions?',
    questionsDescCourse: 'Need help getting started? Our support team is happy to help.',
    contactSupport: 'Contact Support',
    thankYouOrder: 'Thank You for Your Order!',
    orderPlacedDesc:
      "Your order has been successfully placed and confirmed. We're excited to get it to you!",
    emailConfirmation: 'Email Confirmation',
    sentToInbox: 'Sent to your inbox',
    orderConfirmed: 'Order Confirmed',
    orderConfirmedDesc: 'Your payment has been processed and your order is confirmed',
    pickupDetails: 'Pickup Details',
    pickupDate: 'Pickup Date',
    pickupTime: 'Pickup Time',
    preparationPickup: 'Preparation & Pickup',
    readyForPickup: 'Ready for Pickup',
    processingShipping: 'Processing & Shipping',
    processingShippingDesc: "We'll prepare your items and ship within 1-2 business days",
    onTheWay: 'On the Way',
    onTheWayDesc: "You'll receive tracking information via email",
    whatYouCanDo: 'What You Can Do Now',
    checkEmail: 'Check your email for an order confirmation and receipt',
    visitDashboard: 'Visit your account dashboard to track your order status',
    contactUs: 'Contact us if you have any questions about your order',
    viewMyOrders: 'View My Orders',
    continueShopping: 'Continue Shopping',
    questionsDescOrder: 'Our customer support team is here to help. Reach out anytime.',

    // Workshop confirmation
    workshopConfirmed: 'Your Workshop Spot is Reserved!',
    workshopConfirmDesc: 'Your booking is confirmed — we look forward to seeing you!',
    bookingConfirmed: 'Booking Confirmed',
    bookingConfirmedDesc: 'Your payment was processed and your spot is secured.',
    confirmationEmail: 'Confirmation Email',
    confirmationEmailDesc: "You'll receive an email with all workshop details and directions.",
    workshopDay: 'On Workshop Day',
    workshopDayDesc: 'Just show up on time — we take care of the rest. All materials are included.',
    viewBookingDetails: 'View Booking Details',
    browseMoreWorkshops: 'Browse More Workshops',
    questionsDescWorkshop: 'Questions about your workshop? Our team is happy to help.',

    // Layout
    loginRequired: 'Please log in to access your account.',
    loginRequiredOrders: 'Please log in to view your orders.',
    loginRequiredAddresses: 'Please log in to manage your addresses.',

    // Downloads
    downloads: 'Downloads',
    downloadsSubtitle: 'Your downloadable files and digital products.',
    noDownloads: 'No downloads available yet.',
    loginRequiredDownloads: 'Please sign in to view your downloads.',

    // Purchases / Reviews
    purchases: 'Purchases',
    reviews: 'Reviews',
    reviewsSubtitle: 'Your product reviews and feedback.',
    noReviews: 'No reviews submitted yet.',
    loginRequiredReviews: 'Please sign in to view your reviews.',

    // Return Requests
    returnRequests: 'Returns',
    returnRequestsSubtitle: 'Return requests and their status.',
    noReturnRequests: 'No return requests found.',
    loginRequiredReturnRequests: 'Please sign in to view your return requests.',

    // Cancellations
    cancellations: 'Cancellations',
    cancellationsSubtitle: 'Cancellation requests and refunds.',
    noCancellations: 'No cancellation requests found.',
    loginRequiredCancellations: 'Please sign in to view your cancellations.',

    // Payment Methods
    paymentMethods: 'Payment Methods',
    paymentMethodsSubtitle: 'Manage your saved payment methods.',
    noPaymentMethods: 'No payment methods saved.',
    loginRequiredPaymentMethods: 'Please sign in to view your payment methods.',
  },
} as const

export type AccountTranslations = (typeof accountI18n)['de'] | (typeof accountI18n)['en']
