<template>
    <div style="display: flex; flex-direction: column; flex-grow: 1; overflow: auto;">
        <div class="panel-block">
            <div class="select is-fullwidth">
                <select v-on:change="selectAnomalyQuestion" v-model="selectedQuestion">
                    <option v-for="(value, key) in dataSetOptions" v-bind:value="key" v-bind:key="key">{{value.name}}</option>
                </select>
            </div>
            <button class="button" id="answerAnomalyQuestion-button" @click="answerAnomalyQuestion">Answer</button>
        </div>
        <div class="panel-block functionality" v-if="questionExecuted">
            <div class="content" v-if="writtenResponse.length > 0">
                <div v-for="Response in writtenResponse">
                    <p>{{Response['introduction']}}</p>
                    <ul v-if="Response['bulletPoints'].length > 0">
                        <li v-for="bulletPoint in Response['bulletPoints']">
                            {{bulletPoint}}
                        </li>
                    </ul>
                    <p v-if="Response['postData'] !== undefined">{{Response['postData']}}</p>
                    <p>______</p>
                </div>
            </div>
            <div class="content" v-else>
                <p>Not Response Yet</p>
            </div>
        </div>
        <div class="panel-block functionality" v-else>
            <div class="content">
                <ul v-if="questionParameters.length">
                    <li v-for="parameter in questionParameters">
                        {{parameter.name}}:
                        <input v-model="parameter.value" placeholder="Introduce the Parameter Value">
                    </li>
                </ul>
                <ul v-if="questionParametersOption.length">
                    <li v-for="parameter in questionParametersOption">
                        {{parameter.name}}:
                        <select v-model="parameter.value">
                            <option v-for="option in parameterOptions[parameter.type]" v-bind:value="option.value" v-bind:key="option.value">{{option.name}}</option>
                        </select>
                    </li>
                </ul>
                <ul v-if="questionParametersCheckbox.length">
                    <li v-for="parameter in questionParametersCheckbox">
                        <input type="checkbox" v-model="parameter.value">{{parameter.name}}
                    </li>
                </ul>
                <ul v-if="questionListVariables">
                    <li v-for="variable in listVariables">
                        <input type="checkbox" v-model="variable.value">{{variable.name}}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>

    import {mapGetters} from 'vuex'

    export default {
        name: "AnomalyQuestions",

        data() {
            return {
                // The question parameters are the other inputs of the apis which are not a variable nor the data
                questionParameters: '',
                questionParametersOption: [],
                questionParametersCheckbox: [],
                questionListVariables: '',
                selectedQuestion: '',
                listVariables: [],
                listSelectedVariables: []
            }
        },


        props: ['name'],

        computed:{
            ...mapGetters({
                getQuestionParameters: 'getQuestionParameters',
                getQuestionParametersOption: 'getQuestionParametersOption',
                getQuestionParametersCheckbox: 'getQuestionParametersCheckbox',
                getQuestionListVariables: 'getQuestionListVariables',
                writtenResponse: 'getWrittenResponse',
                questionExecuted: 'getQuestionExecuted',
                getOptionsListAlgorithm: 'getOptionsListAlgorithm',
                anomalyVariables: 'getAnomalyVariables'
            }),
            dataSetOptions() {
                return this.$store.getters.getQuestionList;
            },
            parameterOptions() { // In case other lists such as variables names such be added
                return {
                    Algorithm: this.getOptionsListAlgorithm
                };
            }
        },

        methods:{
            selectAnomalyQuestion(){  // Fixes the question parameters, these might be modified in the functionality or asked by daphne
                this.questionParameters = JSON.parse(JSON.stringify(this.getQuestionParameters(this.selectedQuestion)));
                this.questionParametersOption = JSON.parse(JSON.stringify(this.getQuestionParametersOption(this.selectedQuestion)));
                this.questionParametersCheckbox = JSON.parse(JSON.stringify(this.getQuestionParametersCheckbox(this.selectedQuestion)));
                this.questionListVariables = this.getQuestionListVariables(this.selectedQuestion);
                this.listVariables = [];
                this.anomalyVariables.forEach((variable) =>{
                    this.listVariables.push({name: variable, value: false})
                });
                this.$store.commit('updateQuestionExecuted', false);
            },

            answerAnomalyQuestion(){
                if (this.questionListVariables){
                    this.listVariables.forEach((variable)=>{
                        if (variable.value){this.listSelectedVariables.push(variable.name)}
                    });
                }
                this.$store.commit('updateQuestionParameters', this.questionParameters);
                this.$store.commit('updateQuestionParametersOption', this.questionParametersOption);
                this.$store.commit('updateQuestionParametersCheckbox', this.questionParametersCheckbox);
                this.questionParameters = JSON.parse(JSON.stringify(this.getQuestionParameters(this.selectedQuestion)));
                this.questionParametersOption = JSON.parse(JSON.stringify(this.getQuestionParametersOption(this.selectedQuestion)));
                this.questionParametersCheckbox = JSON.parse(JSON.stringify(this.getQuestionParametersCheckbox(this.selectedQuestion)));
                this.$store.commit('updateListSelectedVariables', this.listSelectedVariables);
                this.$store.dispatch('answerAnomalyQuestion', this.selectedQuestion);
            }
        },

        watch: {
            questionExecuted: function(val, oldVal) {
                this.$store.commit('updateNumberAnomalies');
            }
        }

    }


</script>

<style scoped>

</style>