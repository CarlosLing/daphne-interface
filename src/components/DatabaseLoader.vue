<template>
    <div style="display: flex; flex-direction: column; flex-grow: 1; overflow: auto;">
        <div class="panel-block"><b>Select a Sample DataSet...</b></div>
        <div class="panel-block">
            <div class="select is-fullwidth">
                <select v-model="selectedDatabase">
                    <option v-for="option in dataSetOptions" v-bind:value="option.value" v-bind:key="option.value">{{ option.name }}</option>
                </select>
            </div>
            <button class="button" id="loadData-button" @click="loadDatabase">Load</button>
        </div>
        <div class="panel-block"><b>...Or Upload your Database here</b></div>
        <div class="panel-block functionality">
            <p>Database must include 'timestamp'(Time when the anomaly took place), 'anomalyType'(Anomaly Diagnose), and 'anomalyAction'(Action taken to )</p>
            <div class="content">
                <div class="file is-large">
                    <label class="file-label">
                        <input class="file-input" type="file" name="resume" @change="onDatabaseChange">
                        <span class="file-cta">
                            <span class="file-icon">
                                <i class="fas fa-upload"></i>
                            </span>
                            <span class="file-label">
                                Upload your .csv file here
                            </span>
                        </span>
                    </label>
                </div>
            </div>
        </div>
        <div class="panel-block"><b>Loaded data: </b>
            <div v-if="!isDatabaseLoaded">No DataBase loaded yet</div>
            <div v-else>
                {{loadedDatabase}}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "DatabaseLoader",

        data() {
            return {
                isDatabaseLoaded: false,
                selectedDatabase: '',
                loadedDatabase: '',
            }
        },

        props: ['name'],
        computed:{
            dataSetOptions() {
                return this.$store.getters.getOptionsList(this.name);
            }
        },

        methods:{
            loadDatabase(){
                this.$store.dispatch('loadAnomalyDatabase', this.selectedDatabase);
                this.loadedDatabase = this.selectedDatabase + "(Sample data)"; // todo this logic must be into the store
                this.isDatabaseLoaded = true;
            },
            onDatabaseChange() {
                let  fileField = document.querySelector("input[type='file']");
                this.$store.dispatch('loadAnomalyDatabaseFromFile', fileField.files[0]);
                this.isDatabaseLoaded = true;
                this.loadedDatabase = fileField.files[0]['name'] + "(Uploaded)";
            }
        }
    }
</script>

<style scoped>

</style>