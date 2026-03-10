let SOMFY_PORT = 3339;

export function setSomfyPort(port: number) {
  SOMFY_PORT = port;
}

export function getSomfyPort() {
  return SOMFY_PORT;
}