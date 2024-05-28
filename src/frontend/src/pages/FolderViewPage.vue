<template>
    <div>
        <button v-if="currentFolderData" @click="goUpOneFolder">Up one folder</button>
        <FolderElement v-for="folder in subfolders" :key="folder.id" :folder="folder"
            :title-click-function="setCurrentFolderAndUpdate" />
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
            subfolders: [],
            files: [],
            cache: {},
            currentFolderData: {},
        };
    },
    methods: {
        async setCurrentFolderAndUpdate(id) {
            this.$router.push({ query: { folder: id } });
        },
        async updateFolderView(fid) {

            if (!fid) {
                // we are in the root folder
                const responseFolders = await fetch('/api/folders/root');
                const dataFolders = await responseFolders.json();

                const responseFiles = await fetch('/api/files/root');
                const dataFiles = await responseFiles.json();

                this.subfolders = dataFolders;
                this.files = dataFiles;
                this.currentFolderData = null;
            } else {
                // we are in a subfolder
                if (this.cache[fid]) {
                    this.subfolders = this.cache[fid].folders;
                    this.files = this.cache[fid].files;
                    this.currentFolderData = this.cache[fid].folderData;
                } else {
                    // get subfolders, files, and current folder
                    const responseCombined = await fetch(`/api/folders/get/${fid}`);
                    const combinedData = await responseCombined.json();
                    console.log(combinedData);

                    this.currentFolderData = combinedData.find(item => item.type === 'folder');
                    this.subfolders = combinedData.filter(item => item.type === 'subfolder');
                    this.files = combinedData.filter(item => item.type === 'file');

                    this.cache[fid] = { folders: this.subfolders, files: this.files, folderData: this.currentFolderData };
                }
            }
        },
        async goUpOneFolder() {
            if (this.currentFolderData.id) {
                const response = await fetch(`/api/folders/getParent/${this.currentFolderData.id}`);
                const data = await response.json();
                this.setCurrentFolderAndUpdate(data.parent_folder_id);
            } else {
                console.log("We should never not have an id unless we are root!");
            }
        },
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