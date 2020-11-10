var microBitBle;

// モータードライバの制御ピン
// モーター1 : GPIO15, GPIO16
// モーター2 : GPIO13, GPIO14

// GPIO port for Motor1
var gpioPort15;
var gpioPort16;

// GPIO port for Motor2
var gpioPort13;
var gpioPort14;

// i2c
var i2cSlaveDevice;

// Connection Flag
var connected;

// constant value for motor control
var DIR_FORWARD = 0;
var DIR_BACK = 1;

async function connect() {
  microBitBle = await microBitBleFactory.connect();
  msg.innerHTML = "micro:bit BLE接続しました。";

  // I2C
  var i2cAccess = await microBitBle.requestI2CAccess();
  var i2cPort = i2cAccess.ports.get(1);
  i2cSlaveDevice = await i2cPort.open(0x64);

  var control = await i2cSlaveDevice.read8(0x01);
  console.log(control);

  await i2cSlaveDevice.write8(0x01, 0x80);
  control = await i2cSlaveDevice.read8(0x01);
  console.log(control);

  sleep(1000);

  await i2cSlaveDevice.write8(0x00, (0x00 << 2) | 0x00);

  await i2cSlaveDevice.write8(0x00, (0x12 << 2) | 0x01);

  // GPIO
  var gpioAccess = await microBitBle.requestGPIOAccess();
  var mbGpioPorts = gpioAccess.ports;

  // Set GPIO 15/16 to Analog Output for motor1
  gpioPort15 = mbGpioPorts.get(15);
  await gpioPort15.export("out"); //port15 aout
  gpioPort16 = mbGpioPorts.get(16);
  await gpioPort16.export("out"); //port15 aout

  // Set GPIO 15/16 to Analog Output for motor1
  gpioPort13 = mbGpioPorts.get(13);
  await gpioPort13.export("out"); //port13 aout
  gpioPort14 = mbGpioPorts.get(14);
  await gpioPort14.export("out"); //port14 aout
}

async function disconnect() {
  await microBitBle.disconnect();
  msg.innerHTML = "micro:bit BLE接続を切断しました。";
}

// Motor Control for DRV8830
async function drv8830_forward() {
  await i2cSlaveDevice.write8(0x00, (0x12 << 2) | 0x01);
}

async function drv8830_back() {
  await i2cSlaveDevice.write8(0x00, (0x12 << 2) | 0x02);
}

async function drv8830_break() {
  await i2cSlaveDevice.write8(0x00, (0x00 << 2) | 0x03);
}

// Motor Control
async function motor1_control(dir, speed) {
  if (dir == DIR_FORWARD) {
    await gpioPort15.write(speed);
    await gpioPort16.write(0);
  } else if (dir == DIR_BACK) {
    await gpioPort15.write(0);
    await gpioPort16.write(speed);
  } else {
    // 指定外のパラメータが来たら停止する
    await gpioPort15.write(0);
    await gpioPort16.write(0);
  }
}

async function motor2_control(dir, speed) {
  if (dir == DIR_FORWARD) {
    await gpioPort13.write(speed);
    await gpioPort14.write(0);
  } else if (dir == DIR_BACK) {
    await gpioPort13.write(0);
    await gpioPort14.write(speed);
  } else {
    // 指定外のパラメータが来たら停止する
    await gpioPort13.write(0);
    await gpioPort14.write(0);
  }
}

async function motor1_forward() {
  motor1_control(DIR_FORWARD, 1);
}

async function motor1_back() {
  motor1_control(DIR_BACK, 1);
}

async function motor1_stop() {
  motor1_control(DIR_FORWARD, 0);
}

async function motor2_forward() {
  motor1_control(DIR_FORWARD, 1);
}

async function motor2_back() {
  motor1_control(DIR_BACK, 1);
}

async function motor2_stop() {
  motor1_control(DIR_FORWARD, 0);
}
