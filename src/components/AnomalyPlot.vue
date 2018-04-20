<template>
    <div class="column">
        <section class="panel">
            <p class="panel-heading">
                Anomaly Detection |
                <!-- TODO: Desing Heading Text -->
                Anomalies detected: {{numberAnomalies}}  | Anomaly detection method: {{chosenAlgorithm}}
            </p>
            <div class="panel-block" id="main-plot-block">
                <div id="main-plot"></div>
                <div id="selections-block">
                    <div class="card" id="interaction_modes">
                        <header class="card-header">
                            <p class="card-header-title">
                                Mouse Selection
                            </p>
                        </header>
                        <div class="card-content control is-small">
                            <div class="tooltip">
                                <!--<span class="tooltiptext">Zoom/Pan: This option allows zooming/panning on the scatter plot</span>-->
                                <label class="radio">
                                    Zoom/Pan:
                                    <input type="radio" name="mouse-selection" value="zoom-pan" v-model="selectionMode" />
                                </label>
                            </div>
                            <div class="tooltip">
                                <!--<span class="tooltiptext">Drag-select: This option allows selecting designs by dragging over points</span>-->
                                <label class="radio">
                                    Drag-select:
                                    <input type="radio" name="mouse-selection" value="drag-select" v-model="selectionMode" />
                                </label>
                            </div>
                            <div class="tooltip">
                                <!--<span class="tooltiptext">Deselect: This option allows de-selecting designs by dragging over points</span>-->
                                <label class="radio">
                                    Deselect:
                                    <input type="radio" name="mouse-selection" value="de-select" v-model="selectionMode" />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-content is-small">
                            <div class="field">
                                <p class="control">
                                    <button class="button" id="cancel-selection" v-on:click="cancelSelection">Cancel all selections</button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
    import { mapGetters, mapMutations } from 'vuex';
    import * as _ from 'lodash-es';
    import * as d3 from 'd3';
    import 'd3-selection-multi';

    export default {
        name: 'anomaly-plot',
        data() {
            return {
                mainPlotParams: {
                    margin: {top: 20, right: 20, bottom: 30, left: 90},
                    width: 960,
                    height: 450,
                    scale: 1
                },
                transform: d3.zoomIdentity,
                zoom: {},
                xMap: {},
                yMap: {},
                context: {},
                hiddenContext: {}
            }
        },
        computed: {
            ...mapGetters({
                anomalyProblemData: 'getAnomalyProblemData',
                currentDetectedAnomalies: 'getCurrentDetectedAnomalies',
                variableChosen: 'getVariableChosen',
                plotData: 'getPlotData',
                colorMap: 'getColorMap',
                hoveredArch: 'getHoveredArch',
                clickedArch: 'getClickedArch',
                numPoints: 'getNumPoints',
                selectedArchs: 'getSelectedArchs',
                highlightedArchs: 'getHighlightedArchs',
                hiddenArchs: 'getHiddenArchs',
                currentExpression: 'getCurrentExpression',
                websocket: 'getWebsocket',
                chosenAlgorithm: 'getChosenAlgorithm',
                numberAnomalies: 'getNumberAnomalies'
            }),

            plotWidth() {
                return this.mainPlotParams.width - this.mainPlotParams.margin.right - this.mainPlotParams.margin.left;
            },

            plotHeight() {
                return this.mainPlotParams.height - this.mainPlotParams.margin.top - this.mainPlotParams.margin.bottom;
            },

            numSelectedPoints() {
                return this.selectedArchs.filter(point => point).length;
            },

            selectionMode: {
                get() {
                    return this.$store.state.tradespacePlot.selectionMode;
                },
                set(newSelectionMode) {
                    this.$store.commit('updateSelectionMode', newSelectionMode);
                }
            }
        },

        methods: {
            ...mapMutations([
                'updateClickedArch',
                'updateHoveredArch',
            ]),
            resetMainPlot() {
                //Resets the main plot
                d3.select('#main-plot').select('svg').remove();
                d3.select('#main-plot').selectAll('canvas').remove();
                d3.select('#main-plot').style('width', 0 + 'px');
            },

            updatePlot(xIndex, yIndex) {
                this.resetMainPlot();

                // Update width
                this.mainPlotParams.width = document.getElementById('main-plot-block').clientWidth
                    - document.getElementById('selections-block').offsetWidth - 30;
                let margin = this.mainPlotParams.margin;

                // setup x
                let parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
                let xValue = d => parseTime(d[xIndex]); // data -> value
                let xScale = d3.scaleTime().range([0, this.plotWidth]); // value -> display
                // don't want dots overlapping axis, so add in buffer to data domain
                let xBuffer = Math.max((d3.max(this.anomalyProblemData, xValue) - d3.min(this.anomalyProblemData, xValue)) * 0.05, 0.05);
                xScale.domain(d3.extent(this.anomalyProblemData, xValue));
                this.xMap = d => xScale(xValue(d)); // data -> display
                let xAxis = d3.axisBottom(xScale);
                // setup y
                let yValue = d => d[yIndex]; // data -> value

                let yScale = d3.scaleLinear().range([this.plotHeight, 0]); // value -> display
                let yBuffer = Math.max((d3.max(this.anomalyProblemData, yValue) - d3.min(this.anomalyProblemData, yValue)) * 0.05, 0.05);
                yScale.domain([d3.min(this.anomalyProblemData, yValue) - yBuffer, d3.max(this.anomalyProblemData, yValue) + yBuffer]);
                this.yMap = d => yScale(yValue(d)); // data -> display
                let yAxis = d3.axisLeft(yScale);

                d3.select('#main-plot')
                    .style('width', this.mainPlotParams.width + 'px')
                    .style('height', this.mainPlotParams.height + 'px');

                this.zoom = d3.zoom()
                    .scaleExtent([0.4, 25])
                    .on('zoom', d => { //TODO: Limit the movement to the limits of the data
                        this.transform = d3.event.transform;
                        gX.call(xAxis.scale(this.transform.rescaleX(xScale)));
                        gY.call(yAxis.scale(this.transform.rescaleY(yScale)));

                        this.drawAnomalies(this.context);
                    });

                let svg = d3.select('#main-plot')
                    .append('svg')
                    .style('position', 'absolute')
                    .attr('width', this.plotWidth + margin.left + margin.right)
                    .attr('height', this.plotHeight + margin.top + margin.bottom)
                    .call(this.zoom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                let canvas = d3.select('#main-plot')
                    .append('canvas')
                    .style('position', 'absolute')
                    .style('top', margin.top + 'px')
                    .style('left', margin.left + 'px')
                    .attr('width', this.plotWidth)
                    .attr('height', this.plotHeight)
                    .call(this.zoom);

                this.context = canvas.node().getContext('2d');

                let hiddenCanvas = d3.select('#main-plot')
                    .append('canvas')
                    .style('position', 'absolute')
                    .style('top', margin.top + 'px')
                    .style('left', margin.left + 'px')
                    .style('display', 'none')
                    .attr('width', this.plotWidth)
                    .attr('height', this.plotHeight);

                this.hiddenContext = hiddenCanvas.node().getContext('2d');

                // x-axis
                let gX = svg.append('g')
                    .attr('class', 'axis axis-x')
                    .attr('transform', 'translate(0, ' + this.plotHeight + ')')
                    .style('font-size', '16px')
                    .call(xAxis);

                svg.append('text')
                    .attr('transform', 'translate(' + this.plotWidth + ', ' + this.plotHeight + ')')
                    .attr('class', 'label')
                    .attr('y', -6)
                    .style('text-anchor', 'end')
                    .style('font-size', '18px')
                    .text(this.$store.state.problem.outputList[xIndex]);

                // y-axis
                let gY = svg.append('g')
                    .attr('class', 'axis axis-y')
                    .style('font-size', '16px')
                    .call(yAxis);

                svg.append('text')
                    .attr('class', 'label')
                    .attr('transform', 'rotate(-90)')
                    .attr('y', 6)
                    .attr('dy', '.71em')
                    .style('text-anchor', 'end')
                    .style('font-size', '18px')
                    .text(this.$store.state.problem.outputList[yIndex]);

                // Canvas related functions
                //this.drawPoints(this.context, false);
                this.drawAnomalies(this.context);

                // Restore old zoom values if they are there
                gX.call(xAxis.scale(this.transform.rescaleX(xScale)));
                gY.call(yAxis.scale(this.transform.rescaleY(yScale)));

                // Canvas interaction
                let self = this;

                canvas.on('mousemove.inspection', function() { self.canvasMousemove(); });
                canvas.on('click.inspection', function() { self.canvasClick(); });
            },

            drawData(context) {
                context.clearRect(0, 0, this.plotWidth, this.plotHeight);
                context.save();

                let x0 = this.transform.applyX(this.xMap(this.anomalyProblemData[0]));
                let y0 = this.transform.applyY(this.yMap(this.anomalyProblemData[0]));
                context.beginPath();
                context.moveTo(x0,y0);
                this.anomalyProblemData.forEach((point) => {
                    let tx = this.transform.applyX(this.xMap(point));
                    let ty = this.transform.applyY(this.yMap(point));
                    context.lineTo(tx, ty);
                });
                context.stroke();
            },

            drawAnomalies(context){

                context.clearRect(0, 0, this.plotWidth, this.plotHeight);
                context.save();

                let x0 = this.transform.applyX(this.xMap(this.anomalyProblemData[0]));
                let y0 = this.transform.applyY(this.yMap(this.anomalyProblemData[0]));
                context.beginPath();
                context.moveTo(x0,y0);
                this.anomalyProblemData.forEach((point) => {
                    let tx = this.transform.applyX(this.xMap(point));
                    let ty = this.transform.applyY(this.yMap(point));
                    context.lineTo(tx, ty);
                });
                context.stroke();

                this.currentDetectedAnomalies.forEach((point) =>{
                    let tx = this.transform.applyX(this.xMap(point));
                    let ty = this.transform.applyY(this.yMap(point));
                    //console.log(tx, ty);
                    context.fillStyle = 'rgba(255,0,0,255)';
                    context.beginPath();
                    context.arc(tx, ty, 3.3, 0, 2 * Math.PI);
                    context.fill();
                });
                context.restore();
            },

            drawPoints(context, hidden) {
                context.clearRect(0, 0, this.plotWidth, this.plotHeight);
                context.save();

                this.plotData.forEach((point, index) => {
                    let pointColor = this.$store.getters.getPointColor(index);
                    let pointShape = this.$store.getters.getPointShape(index);
                    let tx = this.transform.applyX(this.xMap(point));
                    let ty = this.transform.applyY(this.yMap(point));
                    context.fillStyle = hidden ? point.interactColor : pointColor;
                    if (hidden || pointShape === 'circle') {
                        context.beginPath();
                        context.arc(tx, ty, 3.3, 0, 2 * Math.PI);
                        context.fill();
                    }
                    else if (pointShape === 'cross') {
                        context.fillRect(tx - 4, ty - 1, 8, 2);
                        context.fillRect(tx - 1, ty - 4, 2, 8);
                    }
                });

                context.restore();
            },

            getPointUnderMouse() {
                // Draw the hidden canvas.
                this.drawPoints(this.hiddenContext, true);

                // Get mouse positions from the main canvas.
                let mousePos = d3.mouse(d3.select('#main-plot').select('canvas').node());
                let mouseX = mousePos[0];
                let mouseY = mousePos[1];

                // Pick the colour from the mouse position and max-pool it.
                let color = this.hiddenContext.getImageData(mouseX-3, mouseY-3, 6, 6).data;
                let colorList = {};
                for (let i = 0; i < color.length; i += 4) {
                    let colorRgb = 'rgb(' + color[i] + ',' + color[i+1] + ',' + color[i+2] + ')';
                    if (colorRgb in colorList) {
                        colorList[colorRgb] += 1;
                    }
                    else {
                        colorList[colorRgb] = 1;
                    }
                }
                let maxcolor = -1;
                let maxcolor_num = 0;
                for (let key in colorList) {
                    if (maxcolor_num < colorList[key]) {
                        maxcolor_num = colorList[key];
                        maxcolor = key;
                    }
                }
                if (maxcolor === 0) {
                    maxcolor = -1;
                }
                return maxcolor;
            },

            canvasMousemove() {
                let pointColor = this.getPointUnderMouse();

                // Get the data from our map!
                if (pointColor in this.colorMap) {
                    let point = this.colorMap[pointColor];
                    // Only update if there is a change in the selection
                    if (this.hoveredArch !== point) {
                        this.updateHoveredArch(point);
                    }
                }
                else {
                    // In case nothing is selected just revert everything back to normal
                    if (this.hoveredArch !== -1) {
                        this.updateHoveredArch(-1);
                    }
                }
            },

            canvasClick() {
                let pointColor = this.getPointUnderMouse();

                // Get the data from our map!
                if (pointColor in this.colorMap) {
                    let point = this.colorMap[pointColor];
                    // Only update if there is a change in the selection
                    if (this.clickedArch !== point) {
                        this.updateClickedArch(point);
                    }
                }
            },

            /*
               Removes selections and/or highlights in the scatter plot
               @param option: option to remove all selections and highlights or remove only highlights
            */
            cancelSelection() {
                // Remove both highlights and selections
                this.$store.commit('clearSelectedArchs');
                this.$store.commit('clearHighlightedArchs');
            },

            async updateTargetSelection() {
                let selectedIds = [];
                let nonSelectedIds = [];
                this.selectedArchs.forEach((point, index) => {
                    if (point) {
                        selectedIds.push(index);
                    }
                    else {
                        nonSelectedIds.push(index);
                    }
                });

                try {
                    let reqData = new FormData();
                    reqData.append('selected', JSON.stringify(selected));
                    reqData.append('non_selected', JSON.stringify(non_selected));
                    let dataResponse = await fetch(
                        '/api/ifeed/set-target',
                        {
                            method: 'POST',
                            body: reqData,
                            credentials: 'same-origin'
                        }
                    );

                    if (dataResponse.ok) {
                        console.log('Target selection updated')
                    }
                    else {
                        console.error('Error obtaining the driving features.');
                    }
                }
                catch(e) {
                    console.error('Networking error:', e);
                }
            }
        },

        watch: {
            problemData: function(val, oldVal) {
                this.$store.dispatch('updatePlotData', val);
            },

            variableChosen: function(val, oldVal) {
                this.updatePlot('timestamp', val);
            },

            currentDetectedAnomalies: function(val, oldVal) {
                this.drawAnomalies(this.context)
            },

            hoveredArch: function(val, oldVal) {
                this.drawPoints(this.context, false);
            },

            clickedArch: function(val, oldVal) {
                this.drawPoints(this.context, false);
            },

            selectionMode: function(val, oldVal) {
                let margin = this.mainPlotParams.margin;
                let width  = this.mainPlotParams.width;
                let height = this.mainPlotParams.height;

                if (this.selectionMode === 'zoom-pan') { // Zoom
                    d3.select('#main-plot').select('svg')
                        .on('mousedown.modes',null)
                        .on('mousemove.modes',null)
                        .on('mouseup.modes',null)
                        .call(this.zoom);

                    d3.select('#main-plot').selectAll('canvas')
                        .on('mousedown.modes',null)
                        .on('mousemove.modes',null)
                        .on('mouseup.modes.modes',null)
                        .call(this.zoom);
                }
                else {
                    let svg = d3.select('#main-plot').select('svg')
                        .on('.zoom', null);

                    let canvases = d3.select('#main-plot').selectAll('canvas')
                        .on('.zoom', null);

                    let self = this;
                    let justSelectedArchs = new Set();

                    function selectMousedown() {
                        let mousePos = d3.mouse(this);
                        svg.append('rect')
                            .attrs(
                                {
                                    rx     : 0,
                                    ry     : 0,
                                    class  : 'selection',
                                    x      : mousePos[0],
                                    y      : mousePos[1],
                                    width  : 0,
                                    height : 0,
                                    x0     : mousePos[0],
                                    y0     : mousePos[1]
                                })
                            .style('background-color', '#EEEEEE')
                            .style('opacity', 0.18)
                            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                        justSelectedArchs = new Set();
                    }

                    function selectMousemove() {
                        let selection = svg.select('rect.selection');
                        if (!selection.empty()) {
                            let selectionUpdated = false;
                            let mousePos = d3.mouse(this);

                            let box = {
                                x      : parseInt(selection.attr('x'), 10),
                                y      : parseInt(selection.attr('y'), 10),
                                x0     : parseInt(selection.attr('x0'), 10),
                                y0     : parseInt(selection.attr('y0'), 10),
                                width  : parseInt(selection.attr('width'), 10),
                                height : parseInt(selection.attr('height'), 10)
                            };

                            let move = {
                                x : mousePos[0] - box.x0,
                                y : mousePos[1] - box.y0
                            };

                            if (move.x < 0) {
                                box.x = box.x0 + move.x;
                            }
                            else {
                                box.x = box.x0;
                            }

                            if (move.y < 0) {
                                box.y = box.y0 + move.y;
                            }
                            else {
                                box.y = box.y0;
                            }

                            box.width = Math.abs(move.x);
                            box.height = Math.abs(move.y);

                            selection.attrs(box);

                            let newSelectedArchs = self.selectedArchs.slice();

                            if (self.selectionMode === 'drag-select') { // Make selection
                                self.plotData.forEach((point, index) => {
                                    let tx = self.transform.applyX(self.xMap(point));
                                    let ty = self.transform.applyY(self.yMap(point));

                                    if( tx >= box.x && tx <= box.x + box.width &&
                                        ty >= box.y && ty <= box.y + box.height)
                                    {
                                        if (!self.hiddenArchs[index] && !self.selectedArchs[index]) {
                                            // Select
                                            newSelectedArchs[index] = true;
                                            justSelectedArchs.add(index);
                                            selectionUpdated = true;

                                        }
                                    }
                                    else {
                                        if (!self.hiddenArchs[index] && justSelectedArchs.has(index)) {
                                            // Select
                                            newSelectedArchs[index] = false;
                                            justSelectedArchs.delete(index);
                                            selectionUpdated = true;
                                        }
                                    }
                                });
                            }
                            else {  // De-select
                                self.plotData.forEach((point, index) => {
                                    let tx = self.transform.applyX(self.xMap(point));
                                    let ty = self.transform.applyY(self.yMap(point));

                                    if( tx >= box.x && tx <= box.x + box.width &&
                                        ty >= box.y && ty <= box.y + box.height)
                                    {
                                        if (!self.hiddenArchs[index] && self.selectedArchs[index]) {
                                            newSelectedArchs[index] = false;
                                            justSelectedArchs.add(index);
                                            selectionUpdated = true;
                                        }
                                    }
                                    else {
                                        if (!self.hiddenArchs[index] && justSelectedArchs.has(index)) {
                                            newSelectedArchs[index] = true;
                                            justSelectedArchs.delete(index);
                                            selectionUpdated = true;
                                        }
                                    }
                                });
                            }

                            if (selectionUpdated) {
                                self.$store.commit('updateSelectedArchs', newSelectedArchs);
                            }
                        }
                    }

                    function selectMouseup() {
                        // remove selection frame
                        svg.selectAll('rect.selection').remove();
                        justSelectedArchs.clear();
                    }

                    svg.on('mousedown.modes', selectMousedown)
                        .on('mousemove.modes', selectMousemove)
                        .on('mouseup.modes', selectMouseup);

                    canvases.on('mousedown.modes', selectMousedown)
                        .on('mousemove.modes', selectMousemove)
                        .on('mouseup.modes', selectMouseup);
                }
            },

            selectedArchs: function(val, oldVal) {
                this.drawPoints(this.context, false);
                _.debounce(this.updateTargetSelection, 1000);
            },

            highlightedArchs: function(val, oldVal) {
                this.drawPoints(this.context, false);
            },

            currentExpression: function(val, oldVal) {
                let featureExpression = val;
                this.$store.commit('clearHighlightedArchs');

                // If filter expression is not empty, do something
                let highlightedArchs = _.clone(this.highlightedArchs);
                if (featureExpression !== '' || featureExpression) {
                    this.plotData.forEach((point, index) => {
                        highlightedArchs[index] = this.$store.state.filter.processFilterExpression(point, featureExpression, '&&');
                    });
                }
                this.$store.commit('updateHighlightedArchs', highlightedArchs);
            }
        },

        mounted() {
            window.addEventListener('resize', () => {
                this.updatePlot('index', 'value');
            });
        }
    }
</script>

<style scoped>

</style>