const { google } = require('googleapis');
const storage = require('node-persist');

require('dotenv').config();

const keySource = JSON.parse(process.env.SOURCE_SERVICE_ACCOUNT_KEY);
const keyTarget = JSON.parse(process.env.TARGET_SERVICE_ACCOUNT_KEY);

async function initCalendarClient(key, email) {
    const jwtClient = new google.auth.JWT({
        email: key.client_email,
        key: key.private_key,
        scopes: ['https://www.googleapis.com/auth/calendar'],
        subject: email,
    });
    await jwtClient.authorize();
    return google.calendar({ version: 'v3', auth: jwtClient });
}

async function fetchEvents(calendarClient, calendarId) {
    const res = await calendarClient.events.list({
        calendarId: calendarId,
        timeMin: (new Date()).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
    });
    return res.data.items;
}

async function updateOrInsertEvent(calendarClient, calendarId, sourceEvent, targetEvent) {
    if (targetEvent && new Date(targetEvent.updated) < new Date(sourceEvent.updated)) {
        await calendarClient.events.update({
            calendarId: calendarId,
            eventId: targetEvent.id,
            resource: { ...sourceEvent, id: targetEvent.id, description: sourceEvent.id }
        });
    } else {
        await calendarClient.events.insert({
            calendarId: calendarId,
            resource: { ...sourceEvent, description: sourceEvent.id }
        });
    }
}

async function deleteEvent(calendarClient, calendarId, targetEvent) {
    await calendarClient.events.delete({
        calendarId: calendarId,
        eventId: targetEvent.id
    });
}

async function syncCalendars() {
    await storage.init();

    const calendarSource = await initCalendarClient(
        keySource, process.env.EMAIL_SOURCE
    );

    const calendarTarget = await initCalendarClient(
        keyTarget, process.env.EMAIL_TARGET
    );

    const sourceCalendarId = process.env.SOURCE_CALENDAR_ID;
    const targetCalendarId = process.env.TARGET_CALENDAR_ID;

    const sourceEvents = await fetchEvents(calendarSource, sourceCalendarId);
    const targetEvents = await fetchEvents(calendarTarget, targetCalendarId);

    const targetEventsMap = new Map();
    targetEvents.forEach(event => {
        const sourceEventId = event.description;
        if (sourceEventId) targetEventsMap.set(sourceEventId, event);
    });

    for (let sourceEvent of sourceEvents) {
        const targetEvent = targetEventsMap.get(sourceEvent.id);
        await updateOrInsertEvent(calendarTarget, targetCalendarId, sourceEvent, targetEvent);
        targetEventsMap.delete(sourceEvent.id);
    }

    for (let targetEvent of targetEventsMap.values()) {
        await deleteEvent(calendarTarget, targetCalendarId, targetEvent);
    }
}

syncCalendars();
