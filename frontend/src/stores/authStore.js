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
                        throw new Error("Error logging out");
                    }
                }).then(() => {
                    this.resetUser();
                    window.location.href = '/';
                });
        },

        updateLogin() {
            // Check if the user's authentication status is already stored in the cookies
            const userCookie = document.cookie.split('; ').find(row => row.startsWith('user=j:'));
            const discordUserCookie = document.cookie.split('; ').find(row => row.startsWith('discordUser=j:'));

            // log these
            console.log('Stored user:', userCookie);
            console.log('Stored discordUser:', discordUserCookie);

            if (userCookie && discordUserCookie) {
                this.user = JSON.parse(decodeURIComponent(userCookie.split('=')[1].substring(2)));
                this.discordUser = JSON.parse(decodeURIComponent(discordUserCookie.split('=')[1].substring(2)));

                if (this.user && this.discordUser) {
                    this.loggedIn = true;
                    return;
                }
            }

            // otherwise we start fetching the user data which we can then store in cookies
            console.log("Fetching user data");
            fetch("/auth/user")
                .then((response) => {
                    if (!response.ok) {
                        this.resetUser();
                        throw new Error("Not logged in");
                    }
                    console.log('Auth User Response:', response);
                    return response.json();
                })
                .then((dbUserData) => {
                    if (dbUserData && Object.keys(dbUserData).length > 0) {
                        console.log(dbUserData);
                        this.user = dbUserData;
                        this.loggedIn = true;
                        // DB User
                        document.cookie = `user=j:${encodeURIComponent(JSON.stringify(dbUserData))}`;

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