import { Plugin } from 'obsidian';
import { ChartRenderer } from './chartRenderer';
import { pluginApi } from '@vanakat/plugin-api';
import type { SQLSealRegisterApi } from '@hypersphere/sqlseal'

export default class SQLSealCharts extends Plugin {

  async onload() {
    this.registerWithSQLSeal();
  }

  private registerWithSQLSeal() {
    const api = pluginApi('sqlseal') as SQLSealRegisterApi
    const registar = api.registerForPlugin(this)
    registar.registerView('sqlseal-charts', new ChartRenderer(this.app))
  }
}
