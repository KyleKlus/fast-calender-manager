export interface ConfigGCal {
    clientId: string;
    apiKey: string;
    scope: string;
    discoveryDocs: string[];
    hosted_domain?: string;
}

export type TimeCalendarType = { date: string } | {
    dateTime?: string;
    timeZone: string;
}

const scriptSrcGoogle = "https://accounts.google.com/gsi/client";
const scriptSrcGapi = "https://apis.google.com/js/api.js";

interface ExtendedTokenClient extends google.accounts.oauth2.TokenClient {
    callback?: (resp: any) => void;
    error_callback?: (resp: any) => void;
}

const MAX_RETRIES = 2;

class GCal {
    tokenClient: ExtendedTokenClient | null = null;
    onLoadCallback: any = null;
    calendar: string = "primary";
    tasklist: string = "@default";

    constructor(public config: ConfigGCal) {
        this.initGapiClient = this.initGapiClient.bind(this);
        this.handleSignoutClick = this.handleSignoutClick.bind(this);
        this.handleAuthClick = this.handleAuthClick.bind(this);
        this.createEvent = this.createEvent.bind(this);
        this.listUpcomingEvents = this.listUpcomingEvents.bind(this);
        this.listEvents = this.listEvents.bind(this);
        this.createEventFromNow = this.createEventFromNow.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.setCalendar = this.setCalendar.bind(this);
        this.updateEvent = this.updateEvent.bind(this);
        this.deleteEvent = this.deleteEvent.bind(this);
        this.getEvent = this.getEvent.bind(this);

        try {
            this.handleClientLoad();
        } catch (e) {
            console.log(e);
        }
    }

    get sign(): boolean {
        return !!this.tokenClient;
    }

    /**
     * Auth to the google Api.
     */
    private initGapiClient(): void {
        gapi.client
            .init({
                apiKey: this.config.apiKey,
                discoveryDocs: this.config.discoveryDocs,
                hosted_domain: this.config.hosted_domain,
            })
            .then((): void => {
                if (this.onLoadCallback) {
                    this.onLoadCallback();
                }
            })
            .catch((e: any): void => {
                console.log(e);
            });
    }

    /**
     * Init Google Api
     * And create gapi in global
     */
    private handleClientLoad(): void {
        const scriptGoogle = document.createElement("script");
        const scriptGapi = document.createElement("script");
        scriptGoogle.src = scriptSrcGoogle;
        scriptGoogle.async = true;
        scriptGoogle.defer = true;
        scriptGapi.src = scriptSrcGapi;
        scriptGapi.async = true;
        scriptGapi.defer = true;
        document.body.appendChild(scriptGapi);
        document.body.appendChild(scriptGoogle);
        scriptGapi.onload = (): void => {
            gapi.load("client", this.initGapiClient);
        };
        scriptGoogle.onload = async (): Promise<void> => {
            this.tokenClient = await google.accounts.oauth2.initTokenClient({
                client_id: this.config.clientId,
                scope: this.config.scope,
                prompt: "",
                callback: (): void => { },
            });
        };
    }

    /**
     * Sign in Google user account
     * @returns {Promise<void>} Promise resolved if authentication is successful, rejected if unsuccessful.
     */
    public async handleAuthClick(): Promise<void> {
        if (gapi && this.tokenClient) {
            return new Promise<void>((resolve: (resp: any) => void, reject: (resp: any) => void): void => {
                this.tokenClient!.callback = (resp: any): void => {
                    if (resp.error) {
                        reject(resp);
                    } else {
                        resolve(resp);
                    }
                };
                this.tokenClient!.error_callback = (resp: any): void => {
                    reject(resp);
                };
                const token = localStorage.getItem("u_token");
                let tokenObject = undefined;
                if (token) {
                    tokenObject = JSON.parse(token);
                }
                if (gapi.client.getToken() === null && token === null) {
                    this.tokenClient!.requestAccessToken({ prompt: "" });
                } else {
                    this.tokenClient!.requestAccessToken({ prompt: "" });
                }
            });
        } else {
            console.error("Error: this.gapi not loaded");
            return Promise.reject(new Error("Error: this.gapi not loaded"));
        }
    }

    /**
     * Set the default attribute calendar
     * @param {string} newCalendar
     */
    public setCalendar(newCalendar: string): void {
        this.calendar = newCalendar;
    }

    /**
     * Execute the callback function when gapi is loaded
     * @param callback
     */
    public onLoad(callback: any): void {
        if (gapi) {
            callback();
        } else {
            this.onLoadCallback = callback;
        }
    }

    public async onError(callback: any, retries: number = MAX_RETRIES): Promise<any> {
        try {
            if (gapi) {
                return await callback();
            } else {
                await this.handleAuthClick();
                return this.onError(callback, retries - 1);
            }
        } catch (e) {
            if (retries > 0) {
                await this.handleAuthClick();
                return await this.onError(callback, retries - 1);
            } else {
                console.error("Error: this.gapi not loaded");
                return await Promise.reject(e);
            }
        }
    }

    /**
     * Sign out user google account
     */
    public handleSignoutClick(): void {
        if (gapi) {
            const token = gapi.client.getToken();
            if (token !== null) {
                google.accounts.id.disableAutoSelect();
                google.accounts.oauth2.revoke(token.access_token, (): void => { });
                gapi.client.setToken(null);
            }
        } else {
        }
    }

    /**
     * List all events in the calendar
     * @param {number} maxResults to see
     * @param {string} calendarId to see by default use the calendar attribute
     * @returns {any}
     */
    public async listUpcomingEvents(
        maxResults: number,
        calendarId: string = this.calendar
    ): Promise<any> {
        return await this.onError(async (): Promise<any> => {
            return await gapi.client.calendar.events.list({
                calendarId: calendarId,
                timeMin: new Date().toISOString(),
                showDeleted: false,
                singleEvents: true,
                maxResults: maxResults,
                orderBy: "startTime",
            });
        });
    }

    /**
     * List all events in the calendar queried by custom query options
     * See all available options here https://developers.google.com/calendar/v3/reference/events/list
     * @param {object} queryOptions to see
     * @param {string} calendarId to see by default use the calendar attribute
     * @returns {any}
     */
    public async listEvents(
        queryOptions: object,
        calendarId: string = this.calendar
    ): Promise<any> {
        return await this.onError(async (): Promise<any> => {
            return await gapi.client.calendar.events.list({
                calendarId,
                ...queryOptions,
            });
        });
    }

    public async listTasks(
        queryOptions: object,
        tasklistId: string = this.tasklist
    ): Promise<any> {
        return await this.onError(async (): Promise<any> => {
            return await gapi.client.tasks.tasks.list({
                tasklist: tasklistId,
                ...queryOptions,
            });
        });
    }

    public async updateTask(task: { title?: string; description?: string; due?: string }, taskId: string, tasklistId: string = this.tasklist): Promise<any> {
        return await this.onError(async (): Promise<any> => {
            return await gapi.client.tasks.tasks.update({
                tasklist: tasklistId,
                task: taskId,
                resource: task,
            });
        });
    }


    /**
     * Create an event from the current time for a certain period
     * @param {number} time in minutes for the event
     * @param {string} summary of the event
     * @param {string} description of the event
     * @param {string} calendarId
     * @param {string} timeZone The time zone in which the time is specified. (Formatted as an IANA Time Zone Database name, e.g. "Europe/Zurich".)
     * @returns {any}
     */
    public async createEventFromNow(
        { time, summary, description = "" }: any,
        calendarId: string = this.calendar,
        timeZone: string = "Europe/Paris"
    ): Promise<any> {
        const event = {
            summary,
            description,
            start: {
                dateTime: new Date().toISOString(),
                timeZone: timeZone,
            },
            end: {
                dateTime: new Date(new Date().getTime() + time * 60000).toISOString(),
                timeZone: timeZone,
            },
        };

        return await this.createEvent(event, calendarId);
    }

    /**
     * Create Calendar event
     * @param {string} calendarId for the event.
     * @param {object} event with start and end dateTime
     * @param {string} sendUpdates Acceptable values are: "all", "externalOnly", "none"
     * @returns {any}
     */
    public async createEvent(
        event: { summary?: string; description?: string; end: TimeCalendarType; start: TimeCalendarType, colorId?: string },
        calendarId: string = this.calendar,
        sendUpdates: "all" | "externalOnly" | "none" = "none"
    ): Promise<any> {
        return await this.onError(async (): Promise<any> => {
            return await gapi.client.calendar.events.insert({
                calendarId: calendarId,
                resource: event,
                //@ts-ignore the @types/gapi.calendar package is not up to date(https://developers.google.com/calendar/api/v3/reference/events/insert)
                sendUpdates,
                conferenceDataVersion: 1,
            });
        });
    }

    /**
     * Create Calendar event with video conference
     * @param {string} calendarId for the event.
     * @param {object} event with start and end dateTime
     * @param {string} sendUpdates Acceptable values are: "all", "externalOnly", "none"
     * @returns {any}
     */
    public async createEventWithVideoConference(
        event: any,
        calendarId: string = this.calendar,
        sendUpdates: "all" | "externalOnly" | "none" = "none"
    ): Promise<any> {
        return await this.createEvent(
            {
                ...event,
                conferenceData: {
                    createRequest: {
                        requestId: crypto.randomUUID(),
                        conferenceSolutionKey: {
                            type: "hangoutsMeet",
                        },
                    },
                },
            },
            calendarId,
            sendUpdates
        );
    }

    /**
     * Delete an event in the calendar.
     * @param {string} eventId of the event to delete.
     * @param {string} calendarId where the event is.
     * @returns {any} Promise resolved when the event is deleted.
     */
    async deleteEvent(eventId: string, calendarId: string = this.calendar): Promise<any> {
        return await this.onError(async (): Promise<any> => {
            return await gapi.client.calendar.events.delete({
                calendarId: calendarId,
                eventId: eventId,
            });
        });
    }

    /**
     * Update Calendar event
     * @param {string} calendarId for the event.
     * @param {string} eventId of the event.
     * @param {object} event with details to update, e.g. summary
     * @param {string} sendUpdates Acceptable values are: "all", "externalOnly", "none"
     * @returns {any}
     */
    async updateEvent(
        event: { summary?: string; description?: string; end: TimeCalendarType; start: TimeCalendarType, colorId?: string },
        eventId: string,
        calendarId: string = this.calendar
    ): Promise<any> {
        return await this.onError(async (): Promise<any> => {
            //@ts-ignore the @types/gapi.calendar package is not up to date(https://developers.google.com/calendar/api/v3/reference/events/patch)
            return await gapi.client.calendar.events.update({
                calendarId: calendarId,
                eventId: eventId,
                resource: event,
            });
        });
    }

    /**
     * Get Calendar event
     * @param {string} calendarId for the event.
     * @param {string} eventId specifies individual event
     * @returns {any}
     */

    async getEvent(eventId: string, calendarId: string = this.calendar): Promise<any> {
        return await this.onError(async (): Promise<any> => {
            return await gapi.client.calendar.events.get({
                calendarId: calendarId,
                eventId: eventId,
            });
        });
    }

    /**
     * Get Calendar List
     * @returns {any}
     */
    async listCalendars(): Promise<any> {
        return await this.onError(async (): Promise<any> => {
            return await gapi.client.calendar.calendarList.list();
        });
    }

    /**
     * Create Calendar
     * @param {string} summary, title of the calendar.
     * @returns {any}
     */
    async createCalendar(summary: string): Promise<any> {
        return await this.onError(async (): Promise<any> => {
            return await gapi.client.calendar.calendars.insert({ summary: summary });
        });
    }
}

export default GCal;