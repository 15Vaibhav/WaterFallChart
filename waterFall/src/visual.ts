module powerbi.extensibility.visual {
    interface DataPoint {
        categories: string,
        values: number,
        growth: number
    };
    interface ViewModel {
        dataPoints: DataPoint[];
        maxValue_Y: number;
        minValue_Y: number;
    };

    "use strict";
    export class Visual implements IVisual {
        private settings: VisualSettings;
        private visualSettings: VisualSettings;

        private viewModel: ViewModel;
        private svg: d3.Selection<SVGElement>;
        private xAxisGroup: d3.Selection<SVGElement>;
        private yAxisGroup: d3.Selection<SVGElement>;
        private BarGroup: d3.Selection<SVGElement>;

        private setting = {
            axis: {
                x: { padding: 30 },
                y: { padding: 60 }
            }
        };


        constructor(options: VisualConstructorOptions) {
            this.svg = d3.select(options.element)
                .append('svg')
                .classed('svgClass', true);
            this.xAxisGroup = this.svg.append('g')
                .classed('x-axis', true)
            this.yAxisGroup = this.svg.append('g')
                .classed('y-axis', true)
            this.BarGroup = this.svg.append('g')
                .classed('barGroup', true)
        }

        public update(options: VisualUpdateOptions) {
            this.viewModel = this.getViewModel(options);
            console.log('this is the view model', this.viewModel)
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            console.log('this is the view model', this.settings.Arc.small_rect_postive)



            let width: number = options.viewport.width;
            let height: number = options.viewport.height;
            this.svg.attr({ width: width, height: height });

            this.svg.selectAll('path').remove()
            this.svg.selectAll('barGroup').remove()
            this.svg.selectAll('.texts').remove()
            this.svg.selectAll('rect').remove()
            this.svg.selectAll('.text2').remove()
            this.svg.selectAll('.outer_text').remove()






            function test(value) {
                var thousand = 1000;
                var million = 1000000;
                var billion = 1000000000;
                var trillion = 1000000000000;
                if (value < thousand) {
                    return String(value.toFixed(1));
                }

                if (value >= thousand && value <= 1000000) {
                    return (value / thousand).toFixed(1) + 'k';
                }

                if (value >= million && value <= billion) {
                    return (value / million).toFixed(1) + 'M';
                }

                if (value >= billion && value <= trillion) {
                    return (value / billion).toFixed(1) + 'B';
                }

                else {
                    return (value / trillion).toFixed(1) + 'T';
                }
            }

            function wrap(text, width) {
                // text = text.replace(/^\s+|\s+$/g, '');
                //    console.log('text.....',text)
                //      console.log('width', width)
                text.each(function () {
                    var text = d3.select(this),

                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        y = text.attr("y"),
                        dy = parseFloat(text.attr("dy")),

                        tspan = text.text(null)
                            .append("tspan")
                            .attr("x", 0)
                            .attr("y", y)
                            .attr("dy", dy + "em");
                    while (word = words.pop()) {
                        console.log('text....' + word)
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (this.getComputedTextLength() > width) {
                            console.log("this.getComputedTextLength()", this.getComputedTextLength())
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan")
                                .attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em")
                                .text(word);
                        }
                    }
                });
            }

            let xScale = d3.scale.ordinal()
                .domain(this.viewModel.dataPoints.map(d => d.categories))
                .rangeRoundBands([this.setting.axis.x.padding, width], .4);
            let xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .tickSize(2)

                

            this.xAxisGroup.call(xAxis)
                .attr({ transform: 'translate(' + 0 + ',' + (height - this.setting.axis.y.padding) + ')' })


                .selectAll("text")
                .style("font-size", this.settings.Arc.axis_text_size + "px")
                .style('font-weight', 'bolder')
                .style("font-family", 'serif')
                .style("font-color", "black")
                .call(wrap, 10)





            let yScale = d3.scale.linear()
                .domain([0, this.viewModel.maxValue_Y])
                .range([height - 2*this.setting.axis.x.padding,this.setting.axis.y.padding])

            let yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .tickSize(2)
                .tickFormat(function (d) { console.log('this is d', d); return null });
            this.yAxisGroup
                .call(yAxis)
                .attr({ transform: 'translate(' + (this.setting.axis.x.padding) + ',0)' })



            console.log('height', height)
            console.log(yScale(this.viewModel.dataPoints[0].values))
            console.log(height - yScale(this.viewModel.dataPoints[0].values) - this.setting.axis.y.padding)


            let bars = this.BarGroup
                .selectAll(".bar")
                .data(this.viewModel.dataPoints)
            bars.enter()
                .append("rect")
            bars.attr({
                width:'60px',
                height: height - yScale(this.viewModel.dataPoints[0].values) - this.setting.axis.y.padding,
                y: yScale(this.viewModel.dataPoints[0].values),
                x: xScale(this.viewModel.dataPoints[0].categories)
            })
            .style("fill", this.settings.Arc.total_rect)

            this.BarGroup.append("text")
                .attr({
                    y:yScale(this.viewModel.dataPoints[0].values)+( height - yScale(this.viewModel.dataPoints[0].values) - this.setting.axis.y.padding)/2,
                    x:xScale(this.viewModel.dataPoints[0].categories)+12
                })
                .classed('outer_text', true)
                .text(test(this.viewModel.dataPoints[0].values))
                // .text('1.807M')
                .style("fill", "white")
                .style('font-size', this.settings.Arc.total_rect_text + 'px')
                .style('font-family','arial')
                .style('font-weight','bold')



            // console.log(this.settings.Arc.small_rect_postive)
            let red = this.settings.Arc.small_rect_postive
            let bar_negative = this.settings.Arc.small_rect_negative
            let text_green = this.settings.Arc.text_postive
            let text_red = this.settings.Arc.text_negative
            let text_black = this.settings.Arc.text_black
            let text_white = this.settings.Arc.text_white

            function colorset(color) {
                console.log('color_d', color)
                let x = {}

                if (parseInt(color) > 0) {
                    console.log('dfdf')
                    x = { 'bar': red, 'text': text_white, 'bar_1': text_green }
                } else {
                    x = { 'bar': bar_negative, 'text': text_black, 'bar_1': text_red }
                }
                return x
                // return '#D3D3D3'
            }
            let h = height - yScale(this.viewModel.dataPoints[0].values)
            let cordinate = yScale(this.viewModel.dataPoints[0].values)
            let diffrence = h - cordinate
            console.log('diffrence......', h)
            let pedd = 0;

            for (let i = 1; i < (this.viewModel.dataPoints.length); i++) {
                let x = colorset(this.viewModel.dataPoints[i].growth)
                let per = (100 * this.viewModel.dataPoints[i].values) / this.viewModel.maxValue_Y
                console.log('per....', per)

                console.log('peddd', pedd)


                let bars_1 = this.BarGroup
                    .selectAll(".bar")
                    .data(this.viewModel.dataPoints)
                bars_1.enter()
                    .append("rect")
                bars_1.attr({
                    width: '60px',
                    height: ((per * diffrence)/ 100),
                    y: cordinate,
                    x: xScale(this.viewModel.dataPoints[i].categories)
                })
                    .style('fill', x['bar'])

                this.BarGroup.append("text")
                    .attr({
                        y: cordinate+((per * diffrence)/ 100)/2+4,
                        x: xScale(this.viewModel.dataPoints[i].categories) +18,
                        "font-family": 'arial'
                    })
                    .classed('texts', true)
                    .text(test(this.viewModel.dataPoints[i].values))
                    .style("fill", x['text'])
                    .style("font-size", this.settings.Arc.volume_rect_text + 'px')
                    .style('font-weight','bold')

                cordinate = cordinate+ (per * diffrence) / 100



                let bars_2 = this.BarGroup
                    .selectAll(".bar")
                    .data(this.viewModel.dataPoints)
                bars_2.enter()
                    .append("rect")
                bars_2.attr({
                    width: '60px',
                    height: "20px",
                    y: 20,
                    x: xScale(this.viewModel.dataPoints[i].categories)
                })
                    .style("fill", '#D3D3D3'); 

                    this.BarGroup.append("text")
                        .attr({
                            y: 35,
                            x: xScale(this.viewModel.dataPoints[i].categories) + 30
                        })
                        .classed('text2', true)
                        .text(this.viewModel.dataPoints[i].growth)
                        .style("fill", x['bar_1'])
                        .style('text-anchor', 'middle')
                        .style('font-size', this.settings.Arc.growth_chart_text + 'px')
                        .style('font-family','arial')
                        .style('font-weight','bold')

            }
            console.log('corrr', cordinate)


        }
        private static parseSettings(dataView: DataView): VisualSettings {
            console.log('dvvv', VisualSettings.parse(dataView) as VisualSettings)
            return VisualSettings.parse(dataView) as VisualSettings;
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const settings: VisualSettings = this.visualSettings ||
                VisualSettings.getDefault() as VisualSettings;
            return VisualSettings.enumerateObjectInstances(settings, options);
        }

        private getViewModel(options: VisualUpdateOptions): ViewModel {
            let viewModel = {
                dataPoints: [],
                maxValue_Y: 0,
                minValue_Y: 0
            }
            let dv = options.dataViews;
            let view = dv[0].categorical;
            let categories = view.categories[0];
            let values = view.values[0];
            let growth = view.values[1];
            for (let i = 0; i < categories.values.length; i++) {
                // console.log('values..' + values.values[i])
                if (values.values[i] != null) {
                    viewModel.dataPoints.push({
                        categories: <String>categories.values[i],
                        values: <Number>values.values[i],
                        growth: <Number>growth.values[i]
                    })
                }
            }
            viewModel.maxValue_Y = d3.sum(viewModel.dataPoints, d => d.values);
            viewModel.minValue_Y = d3.min(viewModel.dataPoints, d => d.values);
            viewModel.dataPoints.unshift({
                categories: <String>"Total",
                values: <Number>viewModel.maxValue_Y,
                growth: <Number>0
            })

            console.log("viewModel..", viewModel)
            return viewModel
        }


    }
}