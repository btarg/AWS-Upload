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
                window.location.href = '/auth/discord';
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

        updateLogin() {
            this.loggedIn = false;

            // Check if the user's authentication status is already stored in the cookies
            const userCookie = document.cookie.split('; ').find(row => row.startsWith('user=j:'));
            const discordUserCookie = document.cookie.split('; ').find(row => row.startsWith('discordUser=j:'));

            console.log('Stored user:', userCookie);
            console.log('Stored discordUser:', discordUserCookie);

            // Fetch the DB user data
            console.log("Fetching DB user data");
            fetch("/auth/user")
                .then((response) => {
                    if (!response.ok) {
                        this.resetUser();
                        throw new Error(response.statusText);
                    }
                    console.log('Auth User Response:', response);
                    return response.json();
                })
                .then((dbUserData) => {
                    if (dbUserData && Object.keys(dbUserData).length > 0) {
                        console.log(dbUserData);
                        this.user = dbUserData;
                        this.loggedIn = true;
                    } else {
                        console.log("No user data returned from /auth/user");
                        this.resetUser();
                    }
                })
                .catch((error) => {
                    if (error.message === "Not authenticated") {
                        this.resetUser();
                    }
                });

            if (discordUserCookie) {
                this.discordUser = JSON.parse(decodeURIComponent(discordUserCookie.split('=')[1].substring(2)));
                if (this.discordUser.id) {
                    this.loggedIn = true;
                } else {
                    this.discordUser.null
                    throw new Error("Invalid Discord User Cookie!");
                }

            } else {
                // Fetch the Discord user data
                console.log("Fetching Discord user data");
                fetch("/discord/user")
                    .then((response) => response.json())
                    .then((discordUserData) => {
                        this.discordUser = discordUserData;
                        document.cookie = `discordUser=j:${encodeURIComponent(JSON.stringify(discordUserData))}`;
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        this.resetUser();
                    });
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