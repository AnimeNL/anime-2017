// Copyright 2015 Peter Beverloo. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

"use strict";

var LocationPage = function(application, parameters) {
  SchedulePage.call(this, application);

  this.parameters_ = parameters;
  this.location_ = null;
};

LocationPage.prototype = Object.create(SchedulePage.prototype);

// Names of the floors as is to be displayed in the page card.
LocationPage.FLOORS = {
  '-1': 'Lower ground (Oceans)',
   '0': 'Ground floor (Continents)',
   '1': 'First floor (Rivers)',
   '2': 'Second floor (Mountains)'
};

// Prepares render for this page. We need to know whether the requested floor
// actually exists - an error page has to be displayed if it doesn't.
LocationPage.prototype.PrepareRender = function(currentPage) {
  var parentMethod = SchedulePage.prototype.PrepareRender.bind(this),
      self = this;

  return parentMethod().then(function(schedule) {
    var locationSlug = self.parameters_[2];

    schedule.GetLocations().forEach(function(location) {
      if (locationSlug == location.GetSlug())
        self.location_ = location;    
    });

    // If |self.location_| could be set then we located the location for which
    // this page was intended could not be found. We'll display an error.
  });
};

LocationPage.prototype.OnRender = function(application, container, content) {
  if (this.location_ == null)
    return;  // we don't know which room this is.

  // Always include a back button for the location pages.
  content.insertBefore(this.RenderBackButton(), content.firstChild);

  var listContainer = content.querySelector('#schedule-contents');
  if (!listContainer)
    return;

  var include_hidden = application.GetUser().ShowHiddenEvents(),
      entries = [];

  // All events and sessions for that event need to be individual entries on
  // the schedule for a location.
  this.location_.GetEvents().forEach(function(event) {
    if (event.IsHidden() && !include_hidden)
      return;

    event.GetSessions().forEach(function(session) {
      entries.push(new ScheduleEntry(session.begin, session.end,
                                     event.GetName(), event.GetDescription(),
                                     event.GetNavigateLocation(),
                                     event.IsHidden() ? 'hidden' : ''));
    });
  });

  listContainer.appendChild(
      this.RenderEntries(entries,
                         'No events have been scheduled for this location.'));
};

// Returns the image which should be used for indicating a room.
LocationPage.prototype.GetImage = function() {
  return '/images/location.png';
};

// Returns the name of this location, as it should be rendered.
LocationPage.prototype.GetName = function() {
  if (this.location_)
    return this.location_.GetName();

  return null;
};

// Returns the name of the floor this location exists on.
LocationPage.prototype.GetDescription = function() {
  return LocationPage.FLOORS[this.location_.GetFloor()];
};