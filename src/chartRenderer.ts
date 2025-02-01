import { App } from "obsidian";
import { parseCode } from "./utils/configParser";
import { prepareDataVariables } from "./utils/prepareDataVariables";
import * as echarts from 'echarts';
import type { RendererConfig } from "@hypersphere/sqlseal";

interface Config {
    config: string
}

export class ChartRenderer implements RendererConfig {

    constructor(private readonly app: App) {
    }

    get rendererKey() {
        return 'chart'
    }

    validateConfig(config: string): Config {
        return { config }
    }

    render(config: Config, el: HTMLElement) {
        let isRendered: boolean = false
        let chart: echarts.ECharts | null = null
        return {
            render: ({ columns, data }: { columns: string[], data: Record<string, unknown>[]}) => {
                const { functions, variables } = prepareDataVariables({ columns, data })
                const parsedConfig = parseCode(config.config, functions, variables)
                if (!parsedConfig || typeof parsedConfig !== 'object') {
                    throw new Error('Issue with parsing config')
                }
                const configRecord = parsedConfig as Record<string, any>
                const dataset = [{ id: 'data', source: data }, ...(configRecord.dataset ?? [])]
                configRecord.dataset = dataset

                if (isRendered) {
                    // Data update
                    chart?.setOption(configRecord)
                    return
                }

                el.empty()
                const container = el.createDiv({ cls: 'sqlseal-charts-container' })
                const chartDiv = container.createDiv()
                requestAnimationFrame(() => {
                    const box = container.getBoundingClientRect()
                    const width = box.width
                    const height = box.height
                    chart = echarts.init(chartDiv, null, { height: height, width: width,  })
                    chart.setOption(configRecord)
                    isRendered = true
                })
            },
            error: (error: string) => {
                return createDiv({ text: error, cls: 'sqlseal-error' })
            }
        }
    }
}