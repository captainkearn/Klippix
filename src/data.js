export const guideSteps = [
  {
    title: "Welcome & security",
    shortTitle: "Welcome",
    status: "complete",
    description:
      "Confirm that Klippix is available only on your trusted local network, then change the default account password.",
    path: "passwd",
    command: "passwd"
  },
  {
    title: "Install KIAUH",
    status: "complete",
    description:
      "KIAUH is a menu-driven installer for Klipper and its related services. Install it once, then use it for every component.",
    path: "Download → make executable → launch",
    command:
      "cd ~ && git clone https://github.com/dw-0/kiauh.git && ./kiauh/kiauh.sh"
  },
  {
    title: "Install Klipper",
    status: "current",
    description:
      "Klipper runs the printer firmware and coordinates motion. Use the KIAUH installer from your terminal.",
    path: "KIAUH → Install → Klipper",
    command: "cd ~/kiauh && ./kiauh.sh"
  },
  {
    title: "Install Moonraker",
    description:
      "Moonraker connects Klipper to browser interfaces and other network clients.",
    path: "KIAUH → Install → Moonraker",
    command: "cd ~/kiauh && ./kiauh.sh"
  },
  {
    title: "Choose a web interface",
    description:
      "Install Mainsail, Fluidd, or both. They provide the everyday printer control interface.",
    path: "KIAUH → Install → Mainsail or Fluidd",
    command: "cd ~/kiauh && ./kiauh.sh"
  },
  {
    title: "Install Crowsnest",
    description:
      "Crowsnest manages webcams and video streams for your printer.",
    path: "KIAUH → Install → Crowsnest",
    command: "cd ~/kiauh && ./kiauh.sh"
  },
  {
    title: "Install KlipperScreen",
    description:
      "Add a touch-friendly local interface when your controller has a connected display.",
    path: "KIAUH → Install → KlipperScreen",
    command: "cd ~/kiauh && ./kiauh.sh"
  },
  {
    title: "Add printer configuration",
    status: "files",
    description:
      "Klipper looks for printer configuration in ~/printer_data/config. Upload an existing printer.cfg or edit files directly here.",
    path: "~/printer_data/config",
    command: "mkdir -p ~/printer_data/config"
  },
  {
    title: "Verify & finish",
    description:
      "Check each service, review the logs, and reboot once before connecting to your printer.",
    path: "Review → verify → reboot",
    command: "systemctl --user --no-pager status klipper moonraker"
  }
];

export const initialFiles = [
  { name: "macros", type: "folder", modified: "Today, 10:21", size: "—" },
  { name: "backups", type: "folder", modified: "Jul 24, 14:03", size: "—" },
  {
    name: "printer.cfg",
    type: "file",
    modified: "Today, 11:42",
    size: "6.1 KB",
    content: `[printer]
kinematics: corexy
max_velocity: 300
max_accel: 3000
max_z_velocity: 15
max_z_accel: 100
square_corner_velocity: 5.0

[stepper_x]
step_pin: PB4
dir_pin: !PB3
enable_pin: !PA15
microsteps: 16
rotation_distance: 40
endstop_pin: !PC2
position_endstop: -5
position_max: 330
homing_speed: 60`
  },
  {
    name: "moonraker.conf",
    type: "file",
    modified: "Jul 25, 09:17",
    size: "2.3 KB",
    content: `[server]
host: 0.0.0.0
port: 7125
klippy_uds_address: /home/maker/printer_data/comms/klippy.sock

[authorization]
cors_domains:
    *.local`
  },
  {
    name: "crowsnest.conf",
    type: "file",
    modified: "Jul 25, 09:17",
    size: "1.6 KB",
    content: `[crowsnest]
log_path: ~/printer_data/logs/crowsnest.log
log_level: verbose
delete_log: false`
  },
  {
    name: "mainsail.cfg",
    type: "file",
    modified: "Jul 23, 16:28",
    size: "1.2 KB",
    content: `[include mainsail.cfg]

[virtual_sdcard]
path: ~/printer_data/gcodes`
  },
  {
    name: "fluidd.cfg",
    type: "file",
    modified: "Jul 23, 16:28",
    size: "1.1 KB",
    content: `[include fluidd.cfg]

[display_status]

[pause_resume]`
  }
];
