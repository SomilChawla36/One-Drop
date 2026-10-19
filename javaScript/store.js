/**
 * ONE DROP BLOOD BANK - Core Data Store
 * Shared by all pages. Must be loaded first.
 */

const OneDropStore = {
  KEYS: {
    USERS: 'onedrop_users',
    CURRENT_USER: 'onedrop_current_user',
    DONORS: 'onedrop_donors',
    CERTIFICATES: 'onedrop_certificates',
    REQUESTS: 'onedrop_requests',
    EMERGENCY: 'onedrop_emergency_broadcasts',
    DRIVE_BOOKINGS: 'onedrop_drive_bookings',
    COMMUNITY_STORIES: 'onedrop_community_stories'
  },

  init() {
    if (!localStorage.getItem(this.KEYS.USERS)) {
      const defaultUsers = [
        {
          id: 'usr_demo_1',
          firstName: 'Demo',
          lastName: 'Hero',
          email: 'demo@onedrop.org',
          phone: '+91 98765 43210',
          password: 'demo123',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(this.KEYS.DONORS)) {
      const defaultDonors = [
        {
          id: 'dnr_1',
          fullName: 'Aarav Sharma',
          bloodGroup: 'O+',
          city: 'Central City',
          distance: '3.4 km',
          lastDonated: '4 months ago',
          verified: true,
          status: 'Available for emergency call'
        },
        {
          id: 'dnr_2',
          fullName: 'Meera Kapoor',
          bloodGroup: 'O+',
          city: 'Downtown',
          distance: '5.1 km',
          lastDonated: '6 months ago',
          verified: true,
          status: 'Available now'
        },
        {
          id: 'dnr_3',
          fullName: 'Priya Raman',
          bloodGroup: 'O+',
          city: 'Metro West',
          distance: '7.0 km',
          lastDonated: '3 months ago',
          verified: true,
          status: 'Available now'
        },
        {
          id: 'dnr_4',
          fullName: 'John David',
          bloodGroup: 'A-',
          city: 'North Ridge',
          distance: '2.8 km',
          lastDonated: '5 months ago',
          verified: true,
          status: 'Available for emergency call'
        },
        {
          id: 'dnr_5',
          fullName: 'Rohit Verma',
          bloodGroup: 'B+',
          city: 'East End',
          distance: '4.2 km',
          lastDonated: '2 months ago',
          verified: true,
          status: 'Available now'
        },
        {
          id: 'dnr_6',
          fullName: 'Ananya Gupta',
          bloodGroup: 'AB+',
          city: 'South Extension',
          distance: '6.5 km',
          lastDonated: '4 months ago',
          verified: true,
          status: 'Available now'
        }
      ];
      localStorage.setItem(this.KEYS.DONORS, JSON.stringify(defaultDonors));
    }

    if (!localStorage.getItem(this.KEYS.CERTIFICATES)) {
      const defaultCerts = [
        {
          id: 'CERT-2026-847213',
          name: 'Aryan Sharma',
          email: 'aryan.s@email.com',
          bloodGroup: 'O+',
          date: '17 August 2026',
          center: 'City Hospital Blood Bank',
          issuedOn: '20 August 2026'
        },
        {
          id: 'CERT-2026-113560',
          name: 'Aryan Sharma',
          email: 'aryan.s@email.com',
          bloodGroup: 'O+',
          date: '12 February 2026',
          center: 'Metro Red Cross Center',
          issuedOn: '14 February 2026'
        },
        {
          id: 'CERT-2026-391802',
          name: 'Priya Patel',
          email: 'priya.p@email.com',
          bloodGroup: 'A+',
          date: '28 July 2026',
          center: 'St. Jude Memorial Hospital',
          issuedOn: '30 July 2026'
        }
      ];
      localStorage.setItem(this.KEYS.CERTIFICATES, JSON.stringify(defaultCerts));
    }

    if (!localStorage.getItem(this.KEYS.REQUESTS)) {
      localStorage.setItem(this.KEYS.REQUESTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.EMERGENCY)) {
      localStorage.setItem(this.KEYS.EMERGENCY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.DRIVE_BOOKINGS)) {
      localStorage.setItem(this.KEYS.DRIVE_BOOKINGS, JSON.stringify({}));
    }
    if (!localStorage.getItem(this.KEYS.COMMUNITY_STORIES)) {
      localStorage.setItem(this.KEYS.COMMUNITY_STORIES, JSON.stringify([]));
    }
  },

  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('OneDropStore read error:', key, e);
      return null;
    }
  },

  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('OneDropStore write error:', key, e);
    }
  }
};
