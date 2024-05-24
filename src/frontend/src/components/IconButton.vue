<template>
    <a :href="href" tabindex="-1">
        <button type="button" :class="buttonClasses">
            <i v-if="iconClass" :class="[iconClass, 'mr-2']"></i>
            <span class="button-text">
                <slot></slot>
            </span>
        </button>
    </a>
</template>

<style>
:root {
    --light-buttonPrimary: #b392f0;
    --dark-buttonPrimary: #7e22ce;
    --light-gradient: linear-gradient(#ffffff00, #cfb5ffd8);
    --dark-gradient: linear-gradient(#ffffff00, #7e22ce);
}

.ButtonGradient {
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.3s ease;
}

.ButtonGradient:before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: var(--light-gradient);
    opacity: 0;
    transition: opacity 0.25s ease-out;
    z-index: 1;
}

.ButtonGradient:hover:before {
    opacity: 1;
}

.ButtonGradient>* {
    position: relative;
    z-index: 2;
}

.button-text {
    position: relative;
    z-index: 2;
}

@media (prefers-color-scheme: dark) {
    .ButtonGradient:before {
        background: var(--dark-gradient);
    }

}

@media (prefers-color-scheme: light) {
    .ButtonGradient:before {
        background: var(--light-gradient);
    }

    .button-text {
        /* add a light drop shadow for readability */
        text-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
    }
}
</style>

<script>
export default {
    props: {
        iconClass: {
            type: String,
            default: ''
        },
        primary: {
            type: Boolean,
            default: false
        },
        href: {
            type: String,
            default: ''
        }
    },
    computed: {
        buttonClasses() {
            return [
                'ButtonGradient',
                'flex',
                'justify-center',
                'items-center',
                'rounded-lg',
                'px-4',
                'py-2',
                this.primary ? 'text-light-buttonTextPrimary dark:text-dark-buttonTextPrimary bg-light-buttonPrimary dark:bg-dark-buttonPrimary' : 'text-light-buttonTextSecondary dark:text-dark-buttonTextSecondary bg-light-secondaryButton dark:bg-dark-secondaryButton'
            ];
        }
    }
}
</script>