<template>
    <InfoBox :iconClass="iconClass">
        <div class="flex flex-col items-center gap-y-2">
            <p><slot>Text</slot></p>
            <IconButton class="text-sm" :href="href">{{ buttonText }}<i class="ml-2 fa-solid fa-arrow-right"></i>
            </IconButton>
        </div>
    </InfoBox>
</template>

<script>
import InfoBox from './InfoBox.vue';
import IconButton from './IconButton.vue';

export default {
    components: {
        InfoBox,
        IconButton
    },
    props: {
        iconClass: {
            type: String,
            default: ''
        },
        buttonText: {
            type: String,
            default: ''
        },
        href: {
            type: String,
            default: ''
        }
    }
}
</script>