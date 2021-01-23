const path = require("path");
const osu = require("node-os-utils");
const { info } = require("console");
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload = 20;
let alertFrequencey = 3;

document.getElementById("cpu-model").innerText = cpu.model();
document.getElementById("comp-name").innerText = os.hostname();
document.getElementById("os").innerText = `${os.type()} ${os.arch()}`;
mem.info().then((info) => {
  document.getElementById("mem-total").innerText = info.totalMemMb;
});

setInterval(() => {
  cpu.usage().then((info) => {
    document.getElementById("cpu-usage").innerText = info + "%";
    document.getElementById("cpu-progress").style.width = info + "%";

    if (info > cpuOverload) {
      document.getElementById("cpu-progress").style.background = "red";
    } else {
      document.getElementById("cpu-progress").style.background = "#30c88b";
    }

    if (info > cpuOverload && runNotify(alertFrequencey)) {
      notifyUser({
        title: "CPU Overload",
        body: `CPU is over ${cpuOverload}%`,
        icon: path.join(__dirname, "img", "icon.png"),
      });

      localStorage.setItem("lastNotify", +new Date());
    }
  });

  cpu.free().then((info) => {
    document.getElementById("cpu-free").innerText = info + "%";
  });

  document.getElementById("sys-uptime").innerText = secondsToDhms(os.uptime());
}, 2000);

const secondsToDhms = (seconds) => {
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d, ${h}h, ${m}m, ${s}s`;
};

function notifyUser(option) {
  new Notification(option.title, option);
}

function runNotify(frequency) {
  if (localStorage.getItem("lastNotify") === null) {
    // localStorage.setItem("lastNotify", +new Date());
    return true;
  }

  const notifyTime = new Date(parseInt(localStorage.getItem("lastNotify")));
  const now = new Date();
  const diffTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(diffTime / (1000 * 60));

  if (minutesPassed > frequency) {
    return true;
  } else {
    return false;
  }
}

console.log(`${os.type()} ${os.arch()} ${os.platform()} ${cpu.count()}`);
os.oos().then((name) => console.log("OOS:" + name));
