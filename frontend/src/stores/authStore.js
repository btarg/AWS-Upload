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
                            document.cookie = `discordUser=j:${encodeURIComponent(JSON.stringify(discordUserData))}`;
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
            return new Promise((resolve, reject) => {
                this.loggedIn = false;

                // Check if the user's authentication status is already stored in the cookies
                const userCookie = document.cookie.split('; ').find(row => row.startsWith('user=j:'));
                console.log('Stored user:', userCookie);

                if (userCookie && !override) {
                    this.user = JSON.parse(decodeURIComponent(userCookie.split('=')[1].substring(2)));
                    if (this.user.id) {
                        this.loggedIn = true;
                        resolve(this.user);
                    } else {
                        this.resetUser();
                        reject(new Error("No user id found in cookie"));
                    }
                } else {
                    fetch("/auth/user")
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
            }
        },

        resetUser() {
            this.loggedIn = false;
            this.user = null;
            this.discordUser = null;
            document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "discordUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    },
});