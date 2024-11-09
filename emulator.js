import { instructions } from "./rom/combined_instructions.js";

class Emulator {
  constructor() {
    this.registers = {
      // 8-bit registers
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      H: 0,
      L: 0,
      // 16-bit registers
      SP: 0x3fff,
      PC: 0,
      flags: {
        // set to 1 if the result is zero
        S: 0,
        // set to 1 if a carry occurred from the most significant bit
        Z: 0,
        // set to 1 if a carry occurred from the most significant nibble
        AC: 0,
        // set to 1 if a carry occurred from the most significant byte
        P: 0,
        // set to 1 if the result is zero
        CY: 0,
      },
    };
    // using this.missing just as a flag to stop the loop if there's a missing instruction
    this.missing = false;
    // instructions, stack, and memory are all separate arrays but are all the same size (65536)
    this.instructions = instructions;
    this.memory = new Array(65536).fill(0x0000);
    this.stack = new Array(65536).fill(0x0000);
    this.interruptsEnabled = false;
    this.lastInterrupt = "";
    // input and output ports not being used yet
    this.inputPorts = {
      port0: 0,
      port1: 0,
      port2: 0,
      port3: 0,
    };
    this.outputPorts = {
      port2: 0,
      port3: 0,
      port4: 0,
      port5: 0,
      port6: 0,
    };
  }

  calculateParity(x, size = 8) {
    let i;
    let p = 0;
    x = (x & ((1 << size) - 1));
    for (i = 0; i < size; i++) {
      if (x & 0x1) p++;
      x = x >> 1;
    }
    return (0 == (p & 0x1));
  }

  drawToCanvas(memory) {
    // 0x2400 - 0x3fff is the video memory range
    const VIDEO_MEMORY_START = 0x2400;
    const VIDEO_MEMORY_END = 0x3fff;
    const SCREEN_WIDTH = 224;
    const SCREEN_HEIGHT = 256;

    const canvas = document.getElementById("screen");
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);

    let pixelIndex = 0;
    for (let y = 0; y < SCREEN_HEIGHT; y++) {
      for (let xByte = 0; xByte < SCREEN_WIDTH / 8; xByte++) {
        const byte =
          memory[VIDEO_MEMORY_START + y * (SCREEN_WIDTH / 8) + xByte] || 0;

        for (let bit = 0; bit < 8; bit++) {
          const isPixelSet = (byte & (1 << (7 - bit))) !== 0;
          const color = isPixelSet ? 255 : 0;

          imageData.data[pixelIndex++] = color; // Red
          imageData.data[pixelIndex++] = color; // Green
          imageData.data[pixelIndex++] = color; // Blue
          imageData.data[pixelIndex++] = 255; // Alpha (fully opaque)
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  drawUI() {
    const loop = () => {
      this.drawToCanvas(this.memory); // Update canvas
      const currentInstruction = this.instructions[this.registers.PC];
      // UI updates
      document.getElementById(
        "current-instruction"
      ).innerText = `Current Instruction: ${currentInstruction}`;

      document.getElementById(
        "program-counter"
      ).innerText = `Program Counter: ${this.registers.PC
      } (hex PC: ${this.registers.PC.toString(16)})`;

      requestAnimationFrame(loop); // Continue the loop
    };
    requestAnimationFrame(loop); // Start the loop
  }

  outOfBoundsOrMissingInstruction() {
    if (this.registers.PC < 0 || this.registers.PC >= this.instructions.length) {
      console.error("Program counter out of bounds:", this.registers.PC);
      throw new Error("Execution stopped due to out of bounds error.");
    }

    if (this.missing) {
      console.error("Execution stopped due to unimplemented instruction.");
      console.log("Registers", this.registers);
      //console log memory locations that are not 0
      for (let i = 0; i < this.memory.length; i++) {
        if (i >= 0x2400 && i <= 0x3fff && this.memory[i] !== 0) {
          console.log("Memory location", i.toString(16), "Value", this.memory[i]);
        }
      }
      throw new Error("Execution stopped due to missing instruction error.");
    }
  }

  gameLoop() {
    let i = 0;
    let lastInterruptTime = Date.now();
    const interruptInterval = 1000 / 60; // 1/60th of a second
    const cyclesPerMillisecond = 2000; // 2MHz = 2000 cycles per millisecond
    const cyclesToExecute = cyclesPerMillisecond; // Cycles per millisecond

    const loop = () => {
      const currentTime = Date.now();
      const timeDifference = currentTime - lastInterruptTime;

      // Handle interrupts at the correct interval
      // if (timeDifference >= interruptInterval) {
      //   if (this.lastInterrupt == "d7") {
      //     this.lastInterrupt = "cf";
      //     this.executeInstruction("cf");
      //   } else {
      //     this.lastInterrupt = "d7";
      //     this.executeInstruction("d7");
      //   }
      //   lastInterruptTime = currentTime;
      // }

      // Execute instructions according to the clock cycles
      let cyclesExecuted = 0;
      while (
        cyclesExecuted < cyclesToExecute
      ) {
        // check if the program counter is out of bounds or if the instruction is missing and throw error if so
        this.outOfBoundsOrMissingInstruction();

        this.executeInstruction(this.instructions[this.registers.PC]);

        cyclesExecuted += this.getInstructionCycles(
          this.instructions[this.registers.PC]
        );
        i++;
        // kill the program after the first x number of instructions
        if (i >= 200000) {
          //console log memory locations that are not 0
          for (let i = 0; i < this.memory.length; i++) {
            if (i >= 0x2400 && i <= 0x3fff && this.memory[i] !== 0) {
              console.log("Memory location", i.toString(16), "Value", this.memory[i]);
            }
          }
          return;
        }
      }
      setTimeout(loop, 0); // Schedule the next execution immediately
    };
    setTimeout(loop, 0); // Start the game loop immediately
  }

  // determine cycles for each instruction
  getInstructionCycles(instruction) {
    switch (instruction) {
      case "cf":
        return 4;
      case "d7":
        return 4;
      default:
        return 1; // Default cycle count (if unknown)
    }
  }

  executeInstruction(instruction) {
    let address;
    let hl;
    let result;
    let de;
    let value;
    let psw;
    let bc;
    switch (instruction) {
      case "0x00": // NOP
        this.registers.PC++;
        break;
      case "0x01": // LXI B, D16
        this.registers.C = this.instructions[this.registers.PC + 1];
        this.registers.B = this.instructions[this.registers.PC + 2];
        this.registers.PC += 3;
        break;
      case "0x05": // DCR B
        result = (this.registers.B - 1) & 0xff;
        this.registers.flags.Z = (result == 0);
        this.registers.flags.S = (0x80 == (result & 0x80));
        this.registers.flags.P = this.calculateParity(this.registers.B);
        this.registers.B = result;
        this.registers.PC++;
        break;
      case "0x06": // MVI B, D8
        this.registers.B = this.instructions[this.registers.PC + 1];
        this.registers.PC += 2;
        break;
      case "0x09": // DAD B
        bc = (this.registers.B << 8) | this.registers.C;
        hl = (this.registers.H << 8) | this.registers.L;
        result = hl + bc;
        this.registers.H = (result & 0xff00) >> 8;
        this.registers.L = result & 0xff;
        this.registers.flags.CY = ((result & 0xffff0000) > 0);
        this.registers.PC++;
        break;
      case "0x0d": // DCR C
        result = (this.registers.C - 1) & 0xff;
        this.registers.flags.Z = (result == 0);
        this.registers.flags.S = (0x80 == (result & 0x80));
        this.registers.flags.P = this.calculateParity(this.registers.C);
        this.registers.C = result;
        this.registers.PC++;
        break;
      case "0x0e": // MVI C, D8
        this.registers.C = this.instructions[this.registers.PC + 1];
        this.registers.PC += 2;
        break;
      case "0x0f": // RRC
        let x = this.registers.A;
        this.registers.A = ((x & 1) << 7) | (x >> 1);
        this.registers.flags.CY = (1 == (x & 1));
        this.registers.PC++;
        break;
      case "0x11": // LXI D, D16
        this.registers.E = this.instructions[this.registers.PC + 1];
        this.registers.D = this.instructions[this.registers.PC + 2];
        this.registers.PC += 3;
        break;
      case "0x13": // INX D
        de = (this.registers.D << 8) | this.registers.E;
        de = (de + 1) & 0xffff;
        this.registers.D = (de >> 8) & 0xff;
        this.registers.E = de & 0xff;
        this.registers.PC++;
        break;
      case "0x19": // DAD D
        de = (this.registers.D << 8) | this.registers.E;
        hl = (this.registers.H << 8) | this.registers.L;
        result = hl + de;
        this.registers.H = (result & 0xff00) >> 8;
        this.registers.L = result & 0xff;
        this.registers.flags.CY = ((result & 0xffff0000) != 0);
        this.registers.PC++;
        break;
      case "0x1a": // LDAX D
        address = (this.registers.D << 8) | this.registers.E;
        this.registers.A = this.memory[address];
        this.registers.PC++;
        break;
      case "0x21": // LXI H, D16
        this.registers.L = this.instructions[this.registers.PC + 1];
        this.registers.H = this.instructions[this.registers.PC + 2];
        this.registers.PC += 3;
        break;
      case "0x23": // INX H
        hl = (this.registers.H << 8) | this.registers.L;
        hl = (hl + 1) & 0xffff;
        this.registers.H = (hl >> 8) & 0xff;
        this.registers.L = hl & 0xff;
        this.registers.PC++;
        break;
      case "0x26": // MVI H, D8
        this.registers.H = this.instructions[this.registers.PC + 1];
        this.registers.PC += 2;
        break;
      case "0x29": // DAD H
        hl = (this.registers.H << 8) | this.registers.L;
        result = hl + hl;
        this.registers.H = (result & 0xff00) >> 8;
        this.registers.L = result & 0xff;
        this.registers.flags.CY = ((result & 0xffff0000) != 0);
        this.registers.PC++;
        break;
      case "0x31": // LXI SP, D16
        this.registers.SP =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        this.registers.PC += 3;
        break;
      case "0x32": // STA adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        this.memory[address] = this.registers.A;
        this.registers.PC += 3;
        break;
      case "0x36": // MVI M, D8
        address = (this.registers.H << 8) | this.registers.L;
        this.memory[address] = this.instructions[this.registers.PC + 1];
        this.registers.PC += 2;
        break;
      case "0x3a": // LDA adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        this.registers.A = this.memory[address];
        this.registers.PC += 3;
        break;
      case "0x3e": // MVI A, D8
        this.registers.A = this.instructions[this.registers.PC + 1];
        this.registers.PC += 2;
        break;
      case "0x56": // MOV D, M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.D = this.memory[address];
        this.registers.PC++;
        break;
      case "0x5e": // MOV E, M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.E = this.memory[address];
        this.registers.PC++;
        break;
      case "0x66": // MOV H, M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.H = this.memory[address];
        this.registers.PC++;
        break;
      case "0x6f": // MOV L, A
        this.registers.L = this.registers.A;
        this.registers.PC++;
        break;
      case "0x77": // MOV M, A
        address = (this.registers.H << 8) | this.registers.L;
        this.memory[address] = this.registers.A;
        this.registers.PC++;
        break;
      case "0x7a": // MOV A, D
        this.registers.A = this.registers.D;
        this.registers.PC++;
        break;
      case "0x7b": // MOV A, E
        this.registers.A = this.registers.E;
        this.registers.PC++;
        break;
      case "0x7c": // MOV A, H
        this.registers.A = this.registers.H;
        this.registers.PC++;
        break;
      case "0x7e": // MOV A, M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.A = this.memory[address];
        this.registers.PC++;
        break;
      case "0xa7": // ANA A
        this.registers.A &= this.registers.A;
        this.registers.flags.AC = 0;
        this.registers.flags.CY = 0;
        this.registers.flags.Z = (this.registers.A == 0);
        this.registers.flags.S = (0x80 == (this.registers.A & 0x80));
        this.registers.flags.P = this.calculateParity(this.registers.A);
        this.registers.PC++;
        break;
      case "0xaf": // XRA A
        this.registers.A ^= this.registers.A;
        this.registers.flags.AC = 0;
        this.registers.flags.CY = 0;
        this.registers.flags.Z = (this.registers.A == 0);
        this.registers.flags.S = (0x80 == (this.registers.A & 0x80));
        this.registers.flags.P = this.calculateParity(this.registers.A);
        this.registers.PC++;
        break;
      case "0xc1": // POP B
        this.registers.C = this.stack[this.registers.SP];
        this.registers.B = this.stack[this.registers.SP + 1];
        this.registers.SP += 2;
        this.registers.PC++;
        break;
      case "0xc2": // JNZ adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (this.registers.flags.Z == 0) {
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xc3": // JMP adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        this.registers.PC = address;
        break;
      case "0xc5": // PUSH B
        this.registers.SP -= 1;
        this.stack[this.registers.SP] = this.registers.B;
        this.registers.SP -= 1;
        this.stack[this.registers.SP] = this.registers.C;
        this.registers.PC++;
        break;
      case "0xc6": // ADI D8
        value = this.instructions[this.registers.PC + 1];
        result = this.registers.A + value;
        this.registers.flags.Z = ((result & 0xff) == 0);
        this.registers.flags.S = (0x80 == (result & 0x80));
        this.registers.flags.P = this.calculateParity(result & 0xff);
        this.registers.flags.CY = (result > 0xff);
        this.registers.A = result & 0xff;
        this.registers.PC += 2;
        break;
      case "0xc9": // RET
        this.registers.PC =
          this.stack[this.registers.SP] | (this.stack[this.registers.SP + 1] << 8);
        this.registers.SP += 2; // Move stack pointer up by 2 after popping
        break;
      case "0xcd": // CALL adr
        const ret = this.registers.PC + 2;
        this.memory[this.registers.SP - 1] = (ret >> 8) & 0xff;
        this.memory[this.registers.SP - 2] = ret & 0xff;
        this.registers.SP -= 2;
        this.registers.PC = (this.instructions[this.registers.PC + 2] << 8) | this.instructions[this.registers.PC + 1];
        break;
      case "0xd1": // POP D
        this.registers.E = this.stack[this.registers.SP];
        this.registers.D = this.stack[this.registers.SP + 1];
        this.registers.SP += 2;
        this.registers.PC++;
        break;
      case "0xd3": // OUT D8
        this.registers.PC += 2;
        break;
      case "0xd5": // PUSH D
        this.registers.SP -= 1;
        this.stack[this.registers.SP] = this.registers.D;
        this.registers.SP -= 1;
        this.stack[this.registers.SP] = this.registers.E;
        this.registers.PC++;
        break;
      case "0xe1": // POP H
        this.registers.L = this.stack[this.registers.SP];
        this.registers.H = this.stack[this.registers.SP + 1];
        this.registers.SP += 2;
        this.registers.PC++;
        break;
      case "0xe5": // PUSH H
        this.registers.SP -= 1;
        this.stack[this.registers.SP] = this.registers.H;
        this.registers.SP -= 1;
        this.stack[this.registers.SP] = this.registers.L;
        this.registers.PC++;
        break;
      case "0xe6": // ANI D8
        value = this.instructions[this.registers.PC + 1];
        this.registers.A &= value;
        this.registers.flags.AC = 0;
        this.registers.flags.CY = 0;
        this.registers.flags.Z = (this.registers.A == 0);
        this.registers.flags.S = (0x80 == (this.registers.A & 0x80));
        this.registers.flags.P = this.calculateParity(this.registers.A);
        this.registers.PC += 2;
        break;
      case "0xeb": // XCHG
        let tempD = this.registers.D;
        let tempE = this.registers.E;
        this.registers.D = this.registers.H;
        this.registers.E = this.registers.L;
        this.registers.H = tempD;
        this.registers.L = tempE;
        this.registers.PC++;
        break;
      case "0xf1": // POP PSW
        this.registers.A = this.stack[this.registers.SP + 1];
        psw = this.stack[this.registers.SP];
        this.registers.flags.Z = (0x01 == (psw & 0x01));
        this.registers.flags.S = (0x02 == (psw & 0x02));
        this.registers.flags.P = (0x04 == (psw & 0x04));
        this.registers.flags.CY = (0x05 == (psw & 0x08));
        this.registers.flags.AC = (0x10 == (psw & 0x10));
        this.registers.SP += 2;
        this.registers.PC++;
        break;
      case "0xf5": // PUSH PSW
        psw =
          (this.registers.flags.S << 7) |
          (this.registers.flags.Z << 6) |
          (this.registers.flags.AC << 4) |
          (this.registers.flags.P << 2) |
          this.registers.flags.CY;
        this.registers.SP -= 1;
        this.stack[this.registers.SP] = psw;
        this.registers.SP -= 1;
        this.stack[this.registers.SP] = this.registers.A;
        this.registers.PC++;
        break;
      case "0xfb": // EI
        this.interruptsEnabled = 1;
        this.registers.PC++;
        break;
      case "0xfe": // CPI D8
        value = this.instructions[this.registers.PC + 1];
        result = this.registers.A - value;
        this.registers.flags.Z = (result == 0);
        this.registers.flags.S = (0x80 == (result & 0x80));
        this.registers.flags.P = this.calculateParity(result);
        this.registers.flags.CY = (this.registers.A < value);
        this.registers.PC += 2;
        break;
      default:
        console.log("Unimplemented instruction:", instruction);
        this.missing = true;
        break;
    }
    console.log("Instruction:", instruction, "Registers:", JSON.stringify(this.registers));
  }
}

const emulator = new Emulator();
emulator.gameLoop();
emulator.drawUI();
