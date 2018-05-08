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
                questionParametersOption: '',
                questionParametersCheckbox: '',
                selectedQuestion: ''

            }
        },


        props: ['name'],

        computed:{
            ...mapGetters({
                getQuestionParameters: 'getQuestionParameters',
                getQuestionParametersOption: 'getQuestionParametersOption',
                getQuestionParametersCheckbox: 'getQuestionParametersCheckbox',
                writtenResponse: 'getWrittenResponse',
                questionExecuted: 'getQuestionExecuted',
                getOptionsListAlgorithm: 'getOptionsListAlgorithm'
            }),
            dataSetOptions() {
                return this.$store.getters.getQuestionList;
            },
            parameterOptions() {
                return {
                    Algorithm: this.getOptionsListAlgorithm
                };
            }
        },

        methods:{
            selectAnomalyQuestion(){  // Fixes the question parameters, these might be modified in the functionality or asked by daphne
                this.questionParameters = this.getQuestionParameters(this.selectedQuestion);
                this.questionParametersOption = this.getQuestionParametersOption(this.selectedQuestion);
                this.questionParametersCheckbox = this.getQuestionParametersCheckbox(this.selectedQuestion);
                this.$store.commit('updateQuestionExecuted', false)
            },

            answerAnomalyQuestion(){
                this.$store.commit('updateQuestionParameters', this.questionParameters);
                this.$store.commit('updateQuestionParametersOption', this.questionParametersOption);
                this.$store.commit('updateQuestionParametersCheckbox', this.questionParametersCheckbox);
                this.$store.dispatch('answerAnomalyQuestion', this.selectedQuestion);
            }
        }
    }


</script>

<style scoped>

</style>