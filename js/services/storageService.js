/**
 * SafeRoute Guardian - LocalStorage Persistence Service
 * Persists alerts, routes, contacts, settings, and crowdsourced community reviews.
 */

window.StorageService = (function() {
  const KEYS = {
    ALERTS: 'srg_alerts_v1',
    ROUTES: 'srg_routes_v1',
    CONTACTS: 'srg_contacts_v1',
    SETTINGS: 'srg_settings_v1',
    JOURNEY: 'srg_active_journey_v1',
    REVIEWS: 'srg_community_reviews_v1',
    LOCAL_HELP_REQUESTS: 'srg_local_help_requests_v1',
    BEACON: 'srg_safe_beacon_v1',
    TIMELINE: 'srg_journey_timeline_v1'
  };

  return {
    getAlerts: function() {
      try {
        const data = localStorage.getItem(KEYS.ALERTS);
        return data ? JSON.parse(data) : window.SRG_DATA.defaultAlerts;
      } catch (e) {
        return window.SRG_DATA.defaultAlerts;
      }
    },

    saveAlerts: function(alerts) {
      try {
        localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
      } catch (e) {}
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
        return data ? JSON.parse(data) : window.SRG_DATA.scenarios;
      } catch (e) {
        return window.SRG_DATA.scenarios;
      }
    },

    saveRoutes: function(routes) {
      try {
        localStorage.setItem(KEYS.ROUTES, JSON.stringify(routes));
      } catch (e) {}
    },

    getContacts: function(scenarioId) {
      try {
        const data = localStorage.getItem(KEYS.CONTACTS + '_' + scenarioId);
        if (data) return JSON.parse(data);
        const scenario = (window.SRG_DATA.scenarios || []).find(s => s.id === scenarioId);
        return scenario ? scenario.contacts : [];
      } catch (e) {
        return [];
      }
    },

    saveContacts: function(scenarioId, contacts) {
      try {
        localStorage.setItem(KEYS.CONTACTS + '_' + scenarioId, JSON.stringify(contacts));
      } catch (e) {}
    },

    getCommunityReviews: function() {
      try {
        const data = localStorage.getItem(KEYS.REVIEWS);
        return data ? JSON.parse(data) : window.SRG_DATA.defaultCommunityReviews;
      } catch (e) {
        return window.SRG_DATA.defaultCommunityReviews;
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
        moderationStatus: 'Community Report',
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

    getSafeBeacon: function() { try { const data = localStorage.getItem(KEYS.BEACON); return data ? JSON.parse(data) : null; } catch (e) { return null; } },
    saveSafeBeacon: function(beacon) { try { localStorage.setItem(KEYS.BEACON, JSON.stringify(beacon)); } catch (e) {} },
    clearSafeBeacon: function() { try { localStorage.removeItem(KEYS.BEACON); } catch (e) {} },
    getJourneyTimeline: function() { try { const data = localStorage.getItem(KEYS.TIMELINE); return data ? JSON.parse(data) : []; } catch (e) { return []; } },
    addTimelineEvent: function(event) { const items = this.getJourneyTimeline(); const created = { id: 'timeline-' + Date.now() + Math.random(), timestamp: new Date().toISOString(), ...event }; const next = [created, ...items].slice(0, 100); try { localStorage.setItem(KEYS.TIMELINE, JSON.stringify(next)); } catch (e) {} return created; },

    getSettings: function() {
      try {
        const data = localStorage.getItem(KEYS.SETTINGS);
        return data ? JSON.parse(data) : {
          soundEnabled: true,
          defaultEscalationMinutes: 15,
          highContrast: false,
          showTrafficOverlay: true
        };
      } catch (e) {
        return {
          soundEnabled: true,
          defaultEscalationMinutes: 15,
          highContrast: false,
          showTrafficOverlay: true
        };
      }
    },

    saveSettings: function(settings) {
      try {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
      } catch (e) {}
    },

    clearAllData: function() {
      try {
        localStorage.removeItem(KEYS.ALERTS);
        localStorage.removeItem(KEYS.ROUTES);
        localStorage.removeItem(KEYS.SETTINGS);
        localStorage.removeItem(KEYS.JOURNEY);
        localStorage.removeItem(KEYS.REVIEWS);
        localStorage.removeItem(KEYS.LOCAL_HELP_REQUESTS);
        localStorage.removeItem(KEYS.BEACON);
        localStorage.removeItem(KEYS.TIMELINE);
      } catch (e) {}
    }
  };
})();
