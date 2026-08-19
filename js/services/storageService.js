/**
 * SafeRoute Guardian - Persistence Service
 * Persists alerts, routes, contacts, settings, crowdsourced community reviews,
 * linked dependents, and organization member rosters with strict data isolation.
 */

window.StorageService = (function() {
  const KEYS = {
    ALERTS: 'srg_alerts_v2',
    ROUTES: 'srg_routes_v2',
    CONTACTS: 'srg_contacts_v2',
    SETTINGS: 'srg_settings_v2',
    JOURNEY: 'srg_active_journey_v2',
    REVIEWS: 'srg_community_reviews_v2',
    LOCAL_HELP_REQUESTS: 'srg_local_help_requests_v2',
    BEACON: 'srg_safe_beacon_v2',
    TIMELINE: 'srg_journey_timeline_v2',
    ORG_MEMBERS: 'srg_org_members_v2',
    DEPENDENTS: 'srg_dependents_v2'
  };

  return {
    getAlerts: function() {
      try {
        const data = localStorage.getItem(KEYS.ALERTS);
        return data ? JSON.parse(data) : window.SRG_DATA.defaultAlerts;
      } catch (e) {
        return window.SRG_DATA.defaultAlerts || [];
      }
    },

    saveAlerts: function(alerts) {
      try {
        localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
      } catch (e) {}
    },

    clearAlerts: function() {
      try {
        localStorage.removeItem(KEYS.ALERTS);
      } catch (e) {}
      return [];
    },

    addAlert: function(alertObj) {
      const alerts = this.getAlerts();
      const newAlert = {
        id: 'alt-' + Date.now(),
        timestamp: new Date().toISOString(),
        ...alertObj
      };
      alerts.unshift(newAlert);
      const trimmed = alerts.slice(0, 50);
      this.saveAlerts(trimmed);
      return newAlert;
    },

    getRoutes: function() {
      try {
        const data = localStorage.getItem(KEYS.ROUTES);
        return data ? JSON.parse(data) : ((window.SRG_DATA && window.SRG_DATA.scenarios) || []);
      } catch (e) {
        return (window.SRG_DATA && window.SRG_DATA.scenarios) || [];
      }
    },

    saveRoutes: function(routes) {
      try {
        localStorage.setItem(KEYS.ROUTES, JSON.stringify(routes));
      } catch (e) {}
    },

    getContacts: function(scenarioId) {
      try {
        if (scenarioId) {
          const data = localStorage.getItem(KEYS.CONTACTS + '_' + scenarioId);
          if (data) return JSON.parse(data);
          const scenario = (window.SRG_DATA && window.SRG_DATA.scenarios || []).find(s => s.id === scenarioId);
          if (scenario && scenario.contacts) return scenario.contacts;
        }
        const allScenarios = (window.SRG_DATA && window.SRG_DATA.scenarios) || [];
        if (allScenarios.length > 0 && allScenarios[0].contacts) {
          return allScenarios[0].contacts;
        }
        return [];
      } catch (e) {
        return [];
      }
    },

    saveContacts: function(scenarioId, contacts) {
      try {
        const key = scenarioId ? (KEYS.CONTACTS + '_' + scenarioId) : KEYS.CONTACTS;
        localStorage.setItem(key, JSON.stringify(contacts));
      } catch (e) {}
    },

    addContact: function(contactObj, scenarioId) {
      const contacts = this.getContacts(scenarioId);
      const newContact = {
        id: 'c-' + Date.now(),
        ...contactObj
      };
      contacts.push(newContact);
      this.saveContacts(scenarioId, contacts);
      return contacts;
    },

    getCommunityReviews: function() {
      try {
        const data = localStorage.getItem(KEYS.REVIEWS);
        return data ? JSON.parse(data) : window.SRG_DATA.defaultCommunityReviews;
      } catch (e) {
        return window.SRG_DATA.defaultCommunityReviews || [];
      }
    },

    saveCommunityReviews: function(reviews) {
      try {
        localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
      } catch (e) {}
    },

    addCommunityReview: function(reviewObj) {
      const reviews = this.getCommunityReviews();
      const newReview = {
        id: 'rev-' + Date.now(),
        date: 'Just now',
        moderationStatus: 'Verified Community Report',
        ...reviewObj
      };
      reviews.unshift(newReview);
      this.saveCommunityReviews(reviews);
      return newReview;
    },

    getLocalHelpRequests: function() {
      try {
        const data = localStorage.getItem(KEYS.LOCAL_HELP_REQUESTS);
        return data ? JSON.parse(data) : [];
      } catch (e) { return []; }
    },

    saveLocalHelpRequests: function(requests) {
      try { localStorage.setItem(KEYS.LOCAL_HELP_REQUESTS, JSON.stringify(requests)); } catch (e) {}
    },

    addLocalHelpRequest: function(requestObj) {
      const requests = this.getLocalHelpRequests();
      const request = {
        id: 'help-' + Date.now(),
        createdAt: new Date().toISOString(),
        status: 'REQUEST_SENT',
        ...requestObj
      };
      requests.unshift(request);
      this.saveLocalHelpRequests(requests);
      return request;
    },

    updateLocalHelpRequest: function(requestId, updates) {
      const requests = this.getLocalHelpRequests().map(request => request.id === requestId ? { ...request, ...updates } : request);
      this.saveLocalHelpRequests(requests);
      return requests.find(request => request.id === requestId);
    },

    getSafeBeacon: function() {
      try {
        const data = localStorage.getItem(KEYS.BEACON);
        return data ? JSON.parse(data) : null;
      } catch (e) { return null; }
    },

    saveSafeBeacon: function(beacon) {
      try { localStorage.setItem(KEYS.BEACON, JSON.stringify(beacon)); } catch (e) {}
    },

    clearSafeBeacon: function() {
      try { localStorage.removeItem(KEYS.BEACON); } catch (e) {}
    },

    getJourneyTimeline: function() {
      try {
        const data = localStorage.getItem(KEYS.TIMELINE);
        return data ? JSON.parse(data) : [];
      } catch (e) { return []; }
    },

    getTimeline: function() {
      return this.getJourneyTimeline();
    },

    addTimelineEvent: function(event) {
      const items = this.getJourneyTimeline();
      const created = {
        id: 'timeline-' + Date.now() + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        ...event
      };
      const next = [created, ...items].slice(0, 100);
      try { localStorage.setItem(KEYS.TIMELINE, JSON.stringify(next)); } catch (e) {}
      return created;
    },

    // Organization Members Persistence
    getOrgMembers: function(orgId = 'default') {
      try {
        const raw = localStorage.getItem(KEYS.ORG_MEMBERS + '_' + orgId);
        return raw ? JSON.parse(raw) : (window.SRG_DATA.sampleOrgMembers || []);
      } catch (e) {
        return window.SRG_DATA.sampleOrgMembers || [];
      }
    },

    saveOrgMembers: function(orgId = 'default', members) {
      try {
        localStorage.setItem(KEYS.ORG_MEMBERS + '_' + orgId, JSON.stringify(members));
      } catch (e) {}
    },

    addOrgMember: function(orgId = 'default', memberData) {
      const members = this.getOrgMembers(orgId);
      const newMember = {
        id: 'mem-' + Date.now(),
        name: memberData.name || 'Staff Member',
        email: memberData.email || '',
        role: memberData.role || 'staff',
        title: memberData.title || 'Safety Operations Officer',
        assignedCount: memberData.assignedCount || 0,
        joinedAt: new Date().toISOString()
      };
      members.unshift(newMember);
      this.saveOrgMembers(orgId, members);
      return newMember;
    },

    removeOrgMember: function(orgId = 'default', memberId) {
      const members = this.getOrgMembers(orgId).filter(m => m.id !== memberId);
      this.saveOrgMembers(orgId, members);
      return members;
    },

    // Parent Linked Dependents Persistence
    getLinkedDependents: function() {
      try {
        const raw = localStorage.getItem(KEYS.DEPENDENTS);
        return raw ? JSON.parse(raw) : [
          { id: 'dep-aarav', name: 'Aarav Sharma', relation: 'Son (15 yrs)', school: 'MMU Mullana Campus', activeRoute: 'Student Commute', riskScore: 0, status: 'ON_ROUTE', battery: 88, lastCheckin: '10m ago' }
        ];
      } catch (e) {
        return [];
      }
    },

    saveLinkedDependents: function(dependents) {
      try {
        localStorage.setItem(KEYS.DEPENDENTS, JSON.stringify(dependents));
      } catch (e) {}
    },

    addLinkedDependent: function(depData) {
      const dependents = this.getLinkedDependents();
      const newDep = {
        id: 'dep-' + Date.now(),
        name: depData.name || 'Child Traveler',
        relation: depData.relation || 'Dependent',
        school: depData.school || 'MMU Mullana Campus',
        activeRoute: depData.activeRoute || 'Student Commute',
        riskScore: 0,
        status: 'ON_ROUTE',
        battery: 92,
        lastCheckin: 'Just linked'
      };
      dependents.push(newDep);
      this.saveLinkedDependents(dependents);
      return newDep;
    },

    getSettings: function() {
      try {
        const data = localStorage.getItem(KEYS.SETTINGS);
        return data ? JSON.parse(data) : {
          soundEnabled: true,
          defaultEscalationMinutes: 15,
          highContrast: false,
          emergencyNumbers: ['112', '100', '108']
        };
      } catch (e) {
        return { soundEnabled: true, defaultEscalationMinutes: 15 };
      }
    },

    saveSettings: function(settings) {
      try {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
      } catch (e) {}
    }
  };
})();
