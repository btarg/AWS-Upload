<template>
    <main class="p-6">
        <button v-if="currentFolderData" @click="goUpOneFolder">Up one folder</button>
        <input type="file" @change="onFileUpload" multiple />
        <div class="bg-gray-900 p-4 rounded-lg">
            <div class="flex justify-between items-center">
                <div class="space-y-2 w-full">
                    <FolderElement v-for="folder in subfolders" :key="folder.id" :folder="folder"
                        :title-click-function="setCurrentFolderAndUpdate" />
                    <NewFileElement v-for="file in files" :file="file" :shouldUpload="file.shouldUpload"
                        @delete="onFileDelete" @upload-complete="onFileUpdate" />
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import NewFileElement from '../components/FileBrowser/NewFileElement.vue';
import FolderElement from '../components/FileBrowser/FolderElement.vue';

export default {
    components: {
        NewFileElement,
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
        onFileDelete(fileId) {
            this.files = this.files.filter(file => file.fileid !== fileId);

            // Update the cache
            if (this.$route.params.folderId) {
                if (this.cache[this.$route.params.folderId]) {
                    this.cache[this.$route.params.folderId].files = this.files;
                }
            } else {
                if (this.cache.root) {
                    this.cache.root.files = this.files;
                }
            }
            alert("File deleted.");
        },
        onFileUpload(e) {
            const newFiles = Array.from(e.target.files).map(rawFile => ({ rawFile, shouldUpload: true }));
            this.files = [...this.files, ...newFiles];
        },
        async onFileUpdate(newFileData) {
            console.log("Upload data: " + newFileData.uploadedFile);
            console.log("Replace folder view data: " + newFileData.file);
            const index = this.files.findIndex(file => file.rawFile === newFileData.uploadedFile);
            this.files.splice(index, 1, newFileData.file);
        },
        async setCurrentFolderAndUpdate(id) {
            this.$router.push({ name: 'upload', params: { folderId: id } });
        },
        async updateFolderView(fid) {
            if (!fid) {
                // we are in the root folder
                if (this.cache.root) {
                    this.subfolders = this.cache.root.folders;
                    this.files = this.cache.root.files;
                    this.currentFolderData = null;
                } else {
                    const responseFolders = await fetch('/api/folders/root');
                    const dataFolders = await responseFolders.json();

                    const responseFiles = await fetch('/api/files/root');
                    const dataFiles = await responseFiles.json();

                    this.subfolders = dataFolders;
                    this.files = dataFiles;
                    this.currentFolderData = null;

                    this.cache.root = { folders: this.subfolders, files: this.files };
                }
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

                    // set all of files shouldUpload to false
                    for (let file of this.files) {
                        file.shouldUpload = false;
                    }

                    this.cache[fid] = { folders: this.subfolders, files: this.files, folderData: this.currentFolderData };
                }
            }
        },
        async goUpOneFolder() {
            this.setCurrentFolderAndUpdate(this.currentFolderData.parent_folder_id);
        },
    },

    watch: {
        '$route.params.folderId': {
            immediate: true,
            handler(newVal) {
                this.updateFolderView(newVal);
            },
        },
    },

    async created() {
        try {
            this.updateFolderView(this.$route.params.folderId);
        } catch (error) {
            console.error(error);
        }
    },
};
</script>