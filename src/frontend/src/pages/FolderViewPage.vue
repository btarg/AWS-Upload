<template>
    <div>
        <FolderElement v-for="folder in folders" :key="folder.id" :folder="folder" :title-click-function="setCurrentFolderAndUpdate" />
        <FileElement v-for="file in files" :key="file.id" :file="file" />
    </div>
</template>

<script>
import FileElement from '../components/FileBrowser/FileElement.vue';
import FolderElement from '../components/FileBrowser/FolderElement.vue';

export default {
    components: {
        FileElement,
        FolderElement,
    },

    data() {
        return {
            folders: [],
            files: [],
            cache: {},
        };
    },
    methods: {
        async setCurrentFolderAndUpdate(id) {
            this.$router.push({ query: { folder: id } });
        },
        async updateFolderView(fid) {
            if (this.cache[fid]) {
                this.folders = this.cache[fid].folders;
                this.files = this.cache[fid].files;
            } else {
                if (!fid) {
                    // we are in the root folder
                    const responseFolders = await fetch('/api/folders/root');
                    const dataFolders = await responseFolders.json();

                    const responseFiles = await fetch('/api/files/root');
                    const dataFiles = await responseFiles.json();

                    this.folders = dataFolders;
                    this.files = dataFiles;
                } else {
                    // we are in a subfolder
                    const responseFolders = await fetch(`/api/folders/getSubfolders/${fid}`);
                    const dataFolders = await responseFolders.json();

                    const responseFiles = await fetch(`/api/folders/getFiles/${fid}`);
                    const dataFiles = await responseFiles.json();

                    this.folders = dataFolders;
                    this.files = dataFiles;
                }
                this.cache[fid] = { folders: this.folders, files: this.files };
            }
        }
    },
    watch: {
        '$route.query.folder': {
            immediate: true,
            handler(newVal) {
                this.updateFolderView(newVal);
            },
        },
    },

    async created() {
        try {
            this.updateFolderView(this.$route.query.folder);
            
        } catch (error) {
            console.error(error);
        }
    },
};
</script>