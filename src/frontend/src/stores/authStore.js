import { defineStore } from 'pinia';
import { getJSONPayloadFromCookie } from '../util';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        loggedIn: false,
        user: null,
        discordUser: null
    }),
    actions: {
        logIn() {
            // Store the current URL in the session and redirect to the login page
            fetch('/api/auth/storeRedirect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ redirect: window.location.href })
            }).then(() => {
                window.location.href = '/api/auth/login';
            });
        },

        logOut() {
            fetch("/api/auth/logout")
                .then((response) => {
                    if (!response.ok) {
                        this.resetUser();
                        throw new Error(response.statusText);
                    }
                }).then(() => {
                    this.resetUser();
                    window.location.href = '/';
                });
        },
        updateDiscordUser() {
            return new Promise((resolve, reject) => {
            
                const discordUserPayload = getJSONPayloadFromCookie("discordUser");
                console.log('Stored discord user cookie:', discordUserPayload);

                if (discordUserPayload) {
                    this.discordUser = discordUserPayload;
                    if (this.discordUser.id) {
                        this.loggedIn = true;
                        resolve(this.discordUser);
                    } else {
                        reject(new Error("No user id found in cookie"));
                        this.resetUser();
                    }
                } else {
                    // Fetch the Discord user data
                    fetch("/api/discord/user")
                        .then((response) => response.json())
                        .then((discordUserData) => {
                            this.discordUser = discordUserData;
                            resolve(discordUserData);
                        })
                        .catch((error) => {
                            console.error("Error:", error);
                            this.resetUser();
                            reject(error);
                        });
                }
            });
        },

        updateDBUser(override = false) {
            console.log('Updating DB User: ' + override);
            return new Promise((resolve, reject) => {
                this.loggedIn = false;
                
                // Check if the user's authentication status is already stored in the cookies
                const userPayload = getJSONPayloadFromCookie("dbUser");
                console.log('Stored DB user cookie:', userPayload);

                if (userPayload && !override) {
                    this.user = userPayload;
                    if (this.user.id) {
                        this.loggedIn = true;
                        resolve(this.user);
                    } else {
                        this.resetUser();
                        reject(new Error("No user id found in cookie"));
                        this.resetUser();
                    }
                } else {
                    const authEndpoint = override ? "/api/auth/user?override=true" : "/api/auth/user";
                    fetch(authEndpoint)
                        .then((response) => {
                            if (!response.ok) {
                                this.resetUser();
                                throw new Error(response.statusText);
                            }
                            return response.json();
                        })
                        .then((dbUserData) => {
                            if (dbUserData && Object.keys(dbUserData).length > 0) {
                                this.user = dbUserData;
                                this.loggedIn = true;
                                resolve(dbUserData);
                            } else {
                                this.resetUser();
                                reject(new Error("No user data returned from /api/auth/user"));
                            }
                        })
                        .catch((error) => {
                            if (error.message === "Not authenticated") {
                                this.resetUser();
                            }
                            console.log(error.message);
                            reject(error);
                        });
                }
            });
        },

        async updateLogin() {
            try {
                await this.updateDBUser();
                await this.updateDiscordUser();
            } catch (error) {
                console.error('Error updating login:', error);
                this.resetUser();
            }
        },

        resetUser() {
            this.loggedIn = false;
            this.user = null;
            this.discordUser = null;
            document.cookie = "dbUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "discordUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        }
    },
});