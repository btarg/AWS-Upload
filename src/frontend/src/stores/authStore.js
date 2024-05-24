// authStore.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        loggedIn: false,
        user: null,
        discordUser: null
    }),
    actions: {
        logIn() {
            // Store the current URL in the session and redirect to the login page
            fetch('/auth/storeRedirect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ redirect: window.location.href })
            }).then(() => {
                window.location.href = '/auth/login';
            });
        },

        logOut() {
            fetch("/auth/logout")
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
                const discordUserCookie = document.cookie.split('; ').find(row => row.startsWith('discordUser=j:'));
                console.log('Stored discordUser:', discordUserCookie);

                if (discordUserCookie) {
                    this.discordUser = JSON.parse(decodeURIComponent(discordUserCookie.split('=')[1].substring(2)));
                    if (this.discordUser.id) {
                        this.loggedIn = true;
                        resolve(this.discordUser);
                    } else {
                        this.discordUser = null;
                        reject(new Error("Invalid Discord User Cookie!"));
                    }
                } else {
                    // Fetch the Discord user data
                    fetch("/discord/user")
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
            console.log('Updating DB User');
            return new Promise((resolve, reject) => {
                this.loggedIn = false;

                // Check if the user's authentication status is already stored in the cookies
                const userCookie = document.cookie.split('; ').find(row => row.startsWith('dbUser=j:'));
                console.log('Stored user:', userCookie);

                if (userCookie && !override) {
                    this.user = JSON.parse(decodeURIComponent(userCookie.split('=')[1].substring(2)));
                    if (this.user.id) {
                        this.loggedIn = true;
                        resolve(this.user);
                    } else {
                        this.resetUser();
                        reject(new Error("No user id found in cookie"));
                        this.resetUser();
                    }
                } else {
                    const authEndpoint = override ? "/auth/user?override=true" : "/auth/user";
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
                                reject(new Error("No user data returned from /auth/user"));
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
            this.dbUser = null;
            this.discordUser = null;
            document.cookie = "dbUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "discordUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
        }
    },
});