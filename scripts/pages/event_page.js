// Copyright 2015 Peter Beverloo. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

"use strict";

var EventPage = function(application, parameters) {
  Page.call(this, application);

  this.parameters_ = parameters;
  
  this.event_ = null;
  this.session_ = null;
  this.schedule_ = null;
};

EventPage.prototype = Object.create(Page.prototype);

// Fully written out names of the days in the week, starting on Sunday.
EventPage.DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

// Names of the floors as is to be displayed in the event row.
EventPage.FLOORS = {
  '-1': 'lower ground (Oceans)',
   '0': 'ground floor (Continents)',
   '1': 'first floor (Rivers)',
   '2': 'second floor (Mountains)'
};

EventPage.prototype.PrepareRender = function() {
  var self = this;

  return this.application_.GetSchedule().then(function(schedule) {
    if (self.parameters_.length < 2)
        return;  // no event name in the URL.

    for (var i = 0; i < schedule.events.length; ++i) {
      if (schedule.events[i].slug != self.parameters_[1])
        continue;

      self.event_ = schedule.events[i];
      self.session_ = schedule.events[i].sessions[0];
      self.schedule_ = schedule;
      return;
    }
  });
};

EventPage.prototype.BuildSessionRow = function(session) {
  var listContainer = document.createElement('li'),
      dataContainer = document.createElement('div'),
      when = document.createElement('h2'),
      where = document.createElement('p');

  listContainer.className = 'list-item-event list-item-steward-no-pointer';
  listContainer.setAttribute('event-begin', session.beginTime);
  listContainer.setAttribute('event-end', session.endTime);

  // The information contained in this row should be available even after the
  // event has finished, otherwise it won't be displayed anywhere anymore.
  listContainer.setAttribute('event-class-past', 'past-no-collapse');

  when.textContent = DateUtils.format(session.beginTime, DateUtils.FORMAT_SHORT_DAY) + ', ' + 
                     DateUtils.format(session.beginTime, DateUtils.FORMAT_SHORT_TIME) + ' until ' +
                     DateUtils.format(session.endTime, DateUtils.FORMAT_SHORT_TIME);

  where.textContent = this.session_.location.name + ', ' +
        EventPage.FLOORS[this.session_.location.floor];

  dataContainer.className = 'event';

  dataContainer.appendChild(when);
  dataContainer.appendChild(where);

  listContainer.appendChild(dataContainer);

  return listContainer;
};

EventPage.prototype.BuildEmptyStewardRow = function() {
  var listContainer = document.createElement('li');

  listContainer.className = 'list-item-no-content';
  listContainer.innerHTML = '<i>No stewards have been scheduled for this event.</i>';
  return listContainer;
};

EventPage.prototype.BuildStewardRow = function(steward, beginTime, endTime) {
  var listContainer = document.createElement('li');
  var image = document.createElement('img'),
      dataContainer = document.createElement('div'),
      name = document.createElement('h2'),
      when = document.createElement('p');

  listContainer.className = 'list-item-steward material-ripple light';
  listContainer.setAttribute('event-begin', beginTime);
  listContainer.setAttribute('event-end', endTime);

  listContainer.setAttribute('handler', true);
  listContainer.setAttribute('handler-navigate', '/stewards/' + steward.slug + '/');

  image.setAttribute('src', steward.photo);

  function DateToDisplayTime(date) {
    return date.toTimeString().match(/\d{2}:\d{2}/)[0];
  }

  var whenPrefix = steward.isSenior() ? steward.getStatusLine().split(' ')[0] + ' - '
                                      : '';

  name.textContent = steward.name;
  when.textContent = whenPrefix +
                     DateUtils.format(beginTime, DateUtils.FORMAT_SHORT_DAY) + ', ' + 
                     DateUtils.format(beginTime, DateUtils.FORMAT_SHORT_TIME) + ' until ' +
                     DateUtils.format(endTime, DateUtils.FORMAT_SHORT_TIME);

  dataContainer.appendChild(name);
  dataContainer.appendChild(when);

  listContainer.appendChild(image);
  listContainer.appendChild(dataContainer);

  return listContainer;
};

EventPage.prototype.OnRender = function(application, container, content) {
  if (this.event_ == null)
    return;  // we don't know which event this is.

  var sessionList = content.querySelector('#session-list'),
      stewardList = content.querySelector('#steward-list'),
      description = content.querySelector('#event-description');

  if (!sessionList || !stewardList || !description)
    return;

  var sessionContainer = document.createDocumentFragment(),
      stewardContainer = document.createDocumentFragment(),
      self = this;

  this.event_.sessions.forEach(function(session) {
    sessionContainer.appendChild(self.BuildSessionRow(session));
  });

  var stewardShifts = this.event_.shifts;
  stewardShifts.forEach(function(shift) {
    stewardContainer.appendChild(
        self.BuildStewardRow(shift.volunteer, shift.beginTime, shift.endTime));
  });

  if (!stewardShifts.length)
    stewardContainer.appendChild(this.BuildEmptyStewardRow());

  sessionList.appendChild(sessionContainer);
  stewardList.appendChild(stewardContainer);

  description.innerHTML = this.session_.description;
};

EventPage.prototype.ResolveVariable = function(variable) {
  switch(variable) {
    case 'name':
      return this.GetTitle();
  }

  // Otherwise we fall through to the parent class' resolve method.
  return Page.prototype.ResolveVariable.call(this);
};

EventPage.prototype.GetTitle = function() {
  return this.session_ ? this.session_.name : 'Oops!';
};

EventPage.prototype.GetTemplate = function() {
  return this.session_ ? 'event-page' : 'event-error-page';
};
