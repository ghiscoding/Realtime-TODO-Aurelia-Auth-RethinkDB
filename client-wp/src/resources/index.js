export function configure(config) {
  config.globalResources([
    './elements/bootstrap-tooltip',
    './elements/loading-indicator',
    './value-converters/authenticatedFilter',
    './value-converters/date-format'
  ]);
}
