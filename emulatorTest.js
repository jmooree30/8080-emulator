import { instructions } from "./instructionsTest.js";
import { logger } from "./utils/logger.js";

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
      SP: 0x00,
      PC: 0x100,
      Flags: {
        Carry: this._flagManager.IsSet(this._flagManager.FlagType.Carry),
        Parity: this._flagManager.IsSet(this._flagManager.FlagType.Parity),
        AuxillaryCarry: this._flagManager.IsSet(
          this._flagManager.FlagType.AuxillaryCarry
        ),
        Zero: this._flagManager.IsSet(this._flagManager.FlagType.Zero),
        Sign: this._flagManager.IsSet(this._flagManager.FlagType.Sign),
      },
    };
    // instructions, stack, and memory are all separate arrays but are all the same size (65536)
    this.instructions = instructions;
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
    this._flags = 0x00;
  }

  _parity(val) {
    let bit_count = 0;
    for (let i = 0; i < 8; i++) {
      if (val & (1 << i)) bit_count++;
    }
    return bit_count % 2 == 0;
  }

  _flagManager = {
    get FlagType() {
      return {
        Carry: 0,
        Parity: 2,
        AuxillaryCarry: 4,
        Zero: 6,
        Sign: 7,
      };
    },

    SetFlag: (bit_pos) => {
      this._flags |= (1 << bit_pos);
    },

    IsSet: (bit_pos) => {
      return (this._flags & (1 << bit_pos)) > 0;
    },

    ClearFlag: (bit_pos) => {
      this._flags &= ~(1 << bit_pos);
    },

    CheckAndSet: {
      Carry: (result) => {
        result > 255 || result < 0
          ? this._flagManager.SetFlag(this._flagManager.FlagType.Carry)
          : this._flagManager.ClearFlag(this._flagManager.FlagType.Carry);
      },
      Parity: (result) => {
        this._parity(result)
          ? this._flagManager.SetFlag(this._flagManager.FlagType.Parity)
          : this._flagManager.ClearFlag(this._flagManager.FlagType.Parity);
      },
      AuxillaryCarry: (lhs, rhs) => {
        ((lhs & 0x0f) + (rhs & 0x0f)) & (1 << 4)
          ? this._flagManager.SetFlag(this._flagManager.FlagType.AuxillaryCarry)
          : this._flagManager.ClearFlag(
            this._flagManager.FlagType.AuxillaryCarry
          );
      },
      Zero: (result) => {
        (result & 0xff) === 0
          ? this._flagManager.SetFlag(this._flagManager.FlagType.Zero)
          : this._flagManager.ClearFlag(this._flagManager.FlagType.Zero);
      },
      Sign: (result) => {
        result & (1 << 7)
          ? this._flagManager.SetFlag(this._flagManager.FlagType.Sign)
          : this._flagManager.ClearFlag(this._flagManager.FlagType.Sign);
      },
    },
  };

  _setFlagsOnArithmeticOp(lhs, rhs, rawResult) {
    this._flagManager.CheckAndSet.Carry(rawResult);
    this._flagManager.CheckAndSet.Parity(rawResult);
    this._flagManager.CheckAndSet.AuxillaryCarry(lhs, rhs);
    this._flagManager.CheckAndSet.Sign(rawResult);
    this._flagManager.CheckAndSet.Zero(rawResult);
  };

  _setFlagsOnIncDecOp(lhs, rhs, rawResult) {
    this._flagManager.CheckAndSet.AuxillaryCarry(lhs, rhs);
    this._flagManager.CheckAndSet.Parity(rawResult);
    this._flagManager.CheckAndSet.Sign(rawResult);
    this._flagManager.CheckAndSet.Zero(rawResult);
  };

  _setFlagsOnLogicalOp(raw_result) {
    this._flagManager.ClearFlag(this._flagManager.FlagType.Carry);
    this._flagManager.ClearFlag(this._flagManager.FlagType.AuxillaryCarry);
    this._flagManager.CheckAndSet.Zero(raw_result & 0xff);
    this._flagManager.CheckAndSet.Sign(raw_result);
    this._flagManager.CheckAndSet.Parity(raw_result);
  };

  _add(lhs, rhs, carry = 0) {
    lhs = parseInt(lhs, 16);
    rhs = parseInt(rhs, 16);
    carry = parseInt(carry, 16);
    const raw_result = lhs + rhs + carry;
    this._setFlagsOnArithmeticOp(lhs, rhs + carry, raw_result);
    return raw_result & 0xff;
  };

  _sub(lhs, rhs, carry = 0) {
    lhs = parseInt(lhs, 16);
    rhs = parseInt(rhs, 16);
    carry = parseInt(carry, 16);
    const result = this._add(lhs.toString(16), (~(rhs + carry) + 1).toString(16));
    return result;
  };

  gameLoop() {
    //Skip DAA test
    this.instructions[0x59c] = "0xc3"; //JMP
    this.instructions[0x59d] = "0xc2";
    this.instructions[0x59e] = "0x05";

    const loop = () => {
      setInterval(() => {
        this.executeInstruction(this.instructions[this.registers.PC]);
      }, 1);
    };
    loop();
  }

  executeInstruction(instruction) {
    let address;
    let hl;
    let result;
    let de;
    let value;
    let psw;
    let bc;
    let tempD;
    let tempE;
    let lhs;
    let carry_bit;
    let lowByte;
    let highByte;
    console.log(
      logger(instruction, this.instructions, this.registers.PC, this.registers, this._flagManager)
    );
    switch (instruction) {
      case "0x00": // NOP
        this.registers.PC++;
        break;
      case "0x01": // LXI B, D16
        this.registers.C = this.instructions[this.registers.PC + 1];
        this.registers.B = this.instructions[this.registers.PC + 2];
        this.registers.PC += 3;
        break;
      case "0x02": // STAX B
        address = (this.registers.B << 8) | this.registers.C;
        this.instructions[address] = this.registers.A;
        this.registers.PC++;
        break;
      case "0x03": // INX B
        bc = (this.registers.B << 8) | this.registers.C;
        bc = (bc + 1) & 0xffff;
        this.registers.B = (bc >> 8) & 0xff;
        this.registers.C = bc & 0xff;
        this.registers.PC++;
        break;
      case "0x04": // INR B
        result = (this.registers.B + 1) & 0xff;
        this._setFlagsOnIncDecOp(this.registers.B, 1, result);
        this.registers.B = result;
        this.registers.PC++;
        break;
      case "0x05": // DCR B
        lhs = this.registers.B;
        result = lhs + 0xff;
        this._setFlagsOnIncDecOp(lhs, 0xFF, result);
        this.registers.B = result & 0xff;
        this.registers.PC++;
        break;
      case "0x06": // MVI B, D8
        this.registers.B = parseInt(this.instructions[this.registers.PC + 1], 16);
        this.registers.PC += 2;
        break;
      case "0x07": // RLC
        this._flagManager.ClearFlag(this._flagManager.FlagType.Carry);
        this._flags |= (this.registers.A >> 7) & 0x01;
        this.registers.A <<= 1;
        this.registers.A |= (this._flags & 0x01);
        this.registers.A &= 0xFF;
        this.registers.PC++;
        break;
      case "0x09": // DAD B
        bc = (this.registers.B << 8) | this.registers.C;
        hl = (this.registers.H << 8) | this.registers.L;
        result = hl + bc;
        (result > 0xFFFF | result < 0) ? this._flagManager.SetFlag(this._flagManager.FlagType.Carry) : this._flagManager.ClearFlag(this._flagManager.FlagType.Carry);
        this.registers.H = (result >> 8) & 0xff;
        this.registers.L = result & 0xff;
        this.registers.PC++;
        break;
      case "0x0a": // LDAX B
        address = (this.registers.B << 8) | this.registers.C;
        this.registers.A = this.instructions[address];
        this.registers.PC++;
        break;
      case "0x0b": // DCX B
        bc = (this.registers.B << 8) | this.registers.C;
        bc = (bc - 1) & 0xffff;
        this.registers.B = (bc >> 8) & 0xff;
        this.registers.C = bc & 0xff;
        this.registers.PC++;
        break;
      case "0x0c": // INR C
        lhs = this.registers.C;
        result = lhs + 1;
        this._setFlagsOnIncDecOp(lhs, 1, result);
        this.registers.C = result & 0xff;
        this.registers.PC++;
        break;
      case "0x0d": // DCR C
        lhs = this.registers.C;
        result = lhs + 0xff;
        this._setFlagsOnIncDecOp(this.registers.C, 0xFF, result);
        this.registers.C = result & 0xff;
        this.registers.PC++;
        break;
      case "0x0e": // MVI C, D8
        this.registers.C = parseInt(this.instructions[this.registers.PC + 1], 16);
        this.registers.PC += 2;
        break;
      case "0x0f": // RRC
        this._flagManager.ClearFlag(this._flagManager.FlagType.Carry);
        this._flags |= this.registers.A & 0x01;
        this.registers.A >>= 1;
        this.registers.A |= (this._flags << 7) & 0x80;
        this.registers.A &= 0xFF;
        this.registers.PC++;
        break;
      case "0x11": // LXI D, D16
        this.registers.E = this.instructions[this.registers.PC + 1];
        this.registers.D = this.instructions[this.registers.PC + 2];
        this.registers.PC += 3;
        break;
      case "0x12": // STAX D
        address = (this.registers.D << 8) | this.registers.E;
        this.instructions[address] = this.registers.A;
        this.registers.PC++;
        break;
      case "0x13": // INX D
        de = (this.registers.D << 8) | this.registers.E;
        de = (de + 1) & 0xffff;
        this.registers.D = (de >> 8) & 0xff;
        this.registers.E = de & 0xff;
        this.registers.PC++;
        break;
      case "0x14": // INR D
        lhs = this.registers.D;
        result = lhs + 1;
        this._setFlagsOnIncDecOp(lhs, 1, result);
        this.registers.D = result & 0xff;
        this.registers.PC++;
        break;
      case "0x15": // DCR D
        lhs = this.registers.D;
        result = lhs + 0xff;
        this._setFlagsOnIncDecOp(lhs, 0xFF, result);
        this.registers.D = result & 0xff;
        this.registers.PC++;
        break;
      case "0x16": // MVI D, D8
        this.registers.D = parseInt(this.instructions[this.registers.PC + 1], 16);
        this.registers.PC += 2;
        break;
      case "0x17": // RAL
        carry_bit = this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0;
        this.registers.A & 0x80 ? this._flagManager.SetFlag(0) : this._flagManager.ClearFlag(0);
        this.registers.A <<= 1;
        this.registers.A |= carry_bit & 0x01;
        this.registers.A &= 0xFF;
        this.registers.PC++;
        break;
      case "0x19": // DAD D
        de = (this.registers.D << 8) | this.registers.E;
        hl = (this.registers.H << 8) | this.registers.L;
        result = hl + de;
        (result > 0xFFFF | result < 0) ? this._flagManager.SetFlag(this._flagManager.FlagType.Carry) : this._flagManager.ClearFlag(this._flagManager.FlagType.Carry);
        this.registers.H = (result >> 8) & 0xff;
        this.registers.L = result & 0xff;
        this.registers.PC++;
        break;
      case "0x1a": // LDAX D
        address = (this.registers.D << 8) | this.registers.E;
        this.registers.A = this.instructions[address];
        this.registers.PC++;
        break;
      case "0x1b": // DCX D
        de = (this.registers.D << 8) | this.registers.E;
        de = (de - 1) & 0xffff;
        this.registers.D = (de >> 8) & 0xff;
        this.registers.E = de & 0xff;
        this.registers.PC++;
        break;
      case "0x1c": // INR E
        lhs = this.registers.E;
        result = lhs + 1;
        this._setFlagsOnIncDecOp(lhs, 1, result);
        this.registers.E = result & 0xff;
        this.registers.PC++;
        break;
      case "0x1d": // DCR E
        lhs = this.registers.E;
        result = lhs + 0xff;
        this._setFlagsOnIncDecOp(lhs, 0xFF, result);
        this.registers.E = result & 0xff;
        this.registers.PC++;
        break;
      case "0x1e": // MVI E, D8
        this.registers.E = parseInt(this.instructions[this.registers.PC + 1], 16);
        this.registers.PC += 2;
        break;
      case "0x1f": // RAR
        carry_bit = this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0;
        this.registers.A & 0x01 ? this._flagManager.SetFlag(0) : this._flagManager.ClearFlag(0);
        this.registers.A >>= 1;
        this.registers.A |= (carry_bit << 7) & 0x80;
        this.registers.A &= 0xFF;
        this.registers.PC++;
        break;
      case "0x21": // LXI H, D16
        this.registers.L = this.instructions[this.registers.PC + 1];
        this.registers.H = this.instructions[this.registers.PC + 2];
        this.registers.PC += 3;
        break;
      case "0x22": // SHLD adr
        address = (this.instructions[this.registers.PC + 2] << 8) | this.instructions[this.registers.PC + 1];
        this.instructions[address] = this.registers.L;
        this.instructions[address + 1] = this.registers.H;
        this.registers.PC += 3;
        break;
      case "0x23": // INX H
        hl = (this.registers.H << 8) | this.registers.L;
        hl = (hl + 1) & 0xffff;
        this.registers.H = (hl >> 8) & 0xff;
        this.registers.L = hl & 0xff;
        this.registers.PC++;
        break;
      case "0x24": // INR H
        lhs = this.registers.H;
        result = lhs + 1;
        this._setFlagsOnIncDecOp(lhs, 1, result);
        this.registers.H = result & 0xff;
        this.registers.PC++;
        break;
      case "0x25": // DCR H
        lhs = this.registers.H;
        result = lhs + 0xff;
        this._setFlagsOnIncDecOp(lhs, 0xFF, result);
        this.registers.H = result & 0xff;
        this.registers.PC++;
        break;
      case "0x26": // MVI H, D8
        this.registers.H = parseInt(this.instructions[this.registers.PC + 1], 16);
        this.registers.PC += 2;
        break;
      case "0x29": // DAD H
        hl = (this.registers.H << 8) | this.registers.L;
        result = hl + hl;
        (result > 0xFFFF | result < 0) ? this._flagManager.SetFlag(this._flagManager.FlagType.Carry) : this._flagManager.ClearFlag(this._flagManager.FlagType.Carry);
        this.registers.H = (result >> 8) & 0xff;
        this.registers.L = result & 0xff;
        this.registers.PC++;
        break;
      case "0x2a": // LHLD adr
        address = (parseInt(this.instructions[this.registers.PC + 2], 16) << 8) | parseInt(this.instructions[this.registers.PC + 1], 16);
        this.registers.L = this.instructions[address];
        this.registers.H = this.instructions[address + 1];
        this.registers.PC += 3;
        break;
      case "0x2b": // DCX H
        hl = (this.registers.H << 8) | this.registers.L;
        hl = (hl - 1) & 0xffff;
        this.registers.H = (hl >> 8) & 0xff;
        this.registers.L = hl & 0xff;
        this.registers.PC++;
        break;
      case "0x2c": // INR L
        lhs = this.registers.L;
        result = lhs + 1;
        this._setFlagsOnIncDecOp(lhs, 1, result);
        this.registers.L = result & 0xff;
        this.registers.PC++;
        break;
      case "0x2d": // DCR L
        lhs = this.registers.L;
        result = lhs + 0xff;
        this._setFlagsOnIncDecOp(lhs, 0xFF, result);
        this.registers.L = result & 0xff;
        this.registers.PC++;
        break;
      case "0x2e": // MVI L, D8
        this.registers.L = parseInt(this.instructions[this.registers.PC + 1], 16);
        this.registers.PC += 2;
        break;
      case "0x2f": // CMA
        this.registers.A = (~this.registers.A) & 0xff;
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
        this.instructions[address] = this.registers.A;
        console.log("STA", address, this.instructions[address].toString(16));
        this.registers.PC += 3;
        break;
      case "0x33": // INX SP
        this.registers.SP = (this.registers.SP + 1) & 0xffff;
        this.registers.PC++;
        break;
      case "0x34": // INR M
        address = (this.registers.H << 8) | this.registers.L;
        value = this.instructions[address];
        result = parseInt(value, 16) + 1;
        this._setFlagsOnIncDecOp(value, 1, result);
        this.instructions[address] = result & 0xff;
        this.registers.PC++;
        break;
      case "0x35": // DCR M
        address = (this.registers.H << 8) | this.registers.L;
        value = this.instructions[address];
        result = value + 0xff;
        this._setFlagsOnIncDecOp(value, 0xFF, result);
        this.instructions[address] = result & 0xff;
        this.registers.PC++;
        break;
      case "0x36": // MVI M, D8
        address = (this.registers.H << 8) | this.registers.L;
        this.instructions[address] = this.instructions[this.registers.PC + 1];
        this.registers.PC += 2;
        break;
      case "0x37": // STC
        this._flagManager.SetFlag(this._flagManager.FlagType.Carry);
        this.registers.PC++;
        break;
      case "0x39": // DAD SP
        hl = (this.registers.H << 8) | this.registers.L;
        result = hl + this.registers.SP;
        (result > 0xFFFF | result < 0) ? this._flagManager.SetFlag(this._flagManager.FlagType.Carry) : this._flagManager.ClearFlag(this._flagManager.FlagType.Carry);
        this.registers.H = (result >> 8) & 0xff;
        this.registers.L = result & 0xff;
        this.registers.PC++;
        break;
      case "0x3a": // LDA adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        this.registers.A = this.instructions[address];
        this.registers.PC += 3;
        break;
      case "0x3b": // DCX SP
        this.registers.SP = (this.registers.SP - 1) & 0xffff;
        this.registers.PC++;
        break;
      case "0x3c": // INR A
        result = this.registers.A + 1;
        this._setFlagsOnIncDecOp(this.registers.A, 1, result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0x3d": // DCR A
        lhs = this.registers.A;
        result = lhs + 0xff;
        this._setFlagsOnIncDecOp(this.registers.A, 0xFF, result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0x3e": // MVI A, D8
        this.registers.A = parseInt(this.instructions[this.registers.PC + 1], 16);
        this.registers.PC += 2;
        break;
      case "0x3f": // CMC
        this._flagManager.IsSet(this._flagManager.FlagType.Carry)
          ? this._flagManager.ClearFlag(this._flagManager.FlagType.Carry)
          : this._flagManager.SetFlag(this._flagManager.FlagType.Carry);
        this.registers.PC++;
        break;
      case "0x41": // MOV B, C
        this.registers.B = this.registers.C;
        this.registers.PC++;
        break;
      case "0x42": // MOV B, D
        this.registers.B = this.registers.D;
        this.registers.PC++;
        break;
      case "0x43": // MOV B, E
        this.registers.B = this.registers.E;
        this.registers.PC++;
        break;
      case "0x44": // MOV B, H
        this.registers.B = this.registers.H;
        this.registers.PC++;
        break;
      case "0x45": // MOV B, L
        this.registers.B = this.registers.L;
        this.registers.PC++;
        break;
      case "0x46": // MOV B, M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.B = this.instructions[address];
        this.registers.PC++;
        break;
      case "0x47": // MOV B, A
        this.registers.B = this.registers.A;
        this.registers.PC++;
        break;
      case "0x48": // MOV C, B
        this.registers.C = this.registers.B;
        this.registers.PC++;
        break;
      case "0x4a": // MOV C, D
        this.registers.C = this.registers.D;
        this.registers.PC++;
        break;
      case "0x4b": // MOV C, E
        this.registers.C = this.registers.E;
        this.registers.PC++;
        break;
      case "0x4c": // MOV C, H
        this.registers.C = this.registers.H;
        this.registers.PC++;
        break;
      case "0x4d": // MOV C, L
        this.registers.C = this.registers.L;
        this.registers.PC++;
        break;
      case "0x50": // MOV D, B
        this.registers.D = this.registers.B;
        this.registers.PC++;
        break;
      case "0x4f": // MOV C, A  
        this.registers.C = this.registers.A;
        this.registers.PC++;
        break;
      case "0x51": // MOV D, C
        this.registers.D = this.registers.C;
        this.registers.PC++;
        break;
      case "0x53": // MOV D, E
        this.registers.D = this.registers.E;
        this.registers.PC++;
        break;
      case "0x54": // MOV D, H
        this.registers.D = this.registers.H;
        this.registers.PC++;
        break;
      case "0x55": // MOV D, L
        this.registers.D = this.registers.L;
        this.registers.PC++;
        break;
      case "0x56": // MOV D, M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.D = this.instructions[address];
        this.registers.PC++;
        break;
      case "0x57": // MOV D, A
        this.registers.D = this.registers.A;
        this.registers.PC++;
        break;
      case "0x58": // MOV E, B
        this.registers.E = this.registers.B;
        this.registers.PC++;
        break;
      case "0x59": // MOV E, C
        this.registers.E = this.registers.C;
        this.registers.PC++;
        break;
      case "0x5a": // MOV E, D
        this.registers.E = this.registers.D;
        this.registers.PC++;
        break;
      case "0x5c": // MOV E, H
        this.registers.E = this.registers.H;
        this.registers.PC++;
        break;
      case "0x5d": // MOV E, L
        this.registers.E = this.registers.L;
        this.registers.PC++;
        break;
      case "0x5e": // MOV E, M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.E = this.instructions[address];
        this.registers.PC++;
        break;
      case "0x5f": // MOV E, A
        this.registers.E = this.registers.A;
        this.registers.PC++;
        break;
      case "0x60": // MOV H, B
        this.registers.H = this.registers.B;
        this.registers.PC++;
        break;
      case "0x61": // MOV H, C
        this.registers.H = this.registers.C;
        this.registers.PC++;
        break;
      case "0x62": // MOV H, D
        this.registers.H = this.registers.D;
        this.registers.PC++;
        break;
      case "0x63": // MOV H, E
        this.registers.H = this.registers.E;
        this.registers.PC++;
        break;
      case "0x65": // MOV H, L
        this.registers.H = this.registers.L;
        this.registers.PC++;
        break;
      case "0x66": // MOV H, M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.H = this.instructions[address];
        this.registers.PC++;
        break;
      case "0x67": // MOV H, A
        this.registers.H = this.registers.A;
        this.registers.PC++;
        break;
      case "0x68": // MOV L, B
        this.registers.L = this.registers.B;
        this.registers.PC++;
        break;
      case "0x69": // MOV L, C
        this.registers.L = this.registers.C;
        this.registers.PC++;
        break;
      case "0x6a": // MOV L, D
        this.registers.L = this.registers.D;
        this.registers.PC++;
        break;
      case "0x6b": // MOV L, E
        this.registers.L = this.registers.E;
        this.registers.PC++;
        break;
      case "0x6c": // MOV L, H
        this.registers.L = this.registers.H;
        this.registers.PC++;
        break;
      case "0x6e": // MOV L, M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.L = this.instructions[address];
        this.registers.PC++;
        break;
      case "0x6f": // MOV L, A
        this.registers.L = this.registers.A;
        this.registers.PC++;
        break;
      case "0x70": // MOV M, B
        address = (this.registers.H << 8) | this.registers.L;
        this.instructions[address] = this.registers.B;
        this.registers.PC++;
        break;
      case "0x72": // MOV M, D
        address = (this.registers.H << 8) | this.registers.L;
        this.instructions[address] = this.registers.D;
        this.registers.PC++;
        break;
      case "0x73": // MOV M, E
        address = (this.registers.H << 8) | this.registers.L;
        this.instructions[address] = this.registers.E;
        this.registers.PC++;
        break;
      case "0x74": // MOV M, H
        address = (this.registers.H << 8) | this.registers.L;
        this.instructions[address] = this.registers.H;
        this.registers.PC++;
        break;
      case "0x75": // MOV M, L
        address = (this.registers.H << 8) | this.registers.L;
        this.instructions[address] = this.registers.L;
        this.registers.PC++;
        break;
      case "0x77": // MOV M, A
        address = (this.registers.H << 8) | this.registers.L;
        this.instructions[address] = this.registers.A;
        this.registers.PC++;
        break;
      case "0x78": // MOV A, B
        this.registers.A = this.registers.B;
        this.registers.PC++;
        break;
      case "0x79": // MOV A, C
        this.registers.A = this.registers.C;
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
      case "0x7d": // MOV A, L
        this.registers.A = this.registers.L;
        this.registers.PC++;
        break;
      case "0x7e": // MOV A, M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.A = this.instructions[address];
        this.registers.PC++;
        break;
      case "0x80": // ADD B
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.B.toString(16));
        this.registers.PC++;
        break;
      case "0x81": // ADD C
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.C.toString(16));
        this.registers.PC++;
        break;
      case "0x82": // ADD D
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.D.toString(16));
        this.registers.PC++;
        break;
      case "0x83": // ADD E
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.E.toString(16));
        this.registers.PC++;
        break;
      case "0x84": // ADD H
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.H.toString(16));
        this.registers.PC++;
        break;
      case "0x85": // ADD L
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.L.toString(16));
        this.registers.PC++;
        break;
      case "0x86": // ADD M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.A = this._add(this.registers.A.toString(16), this.instructions[address].toString(16));
        this.registers.PC++;
        break;
      case "0x87": // ADD A
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.A.toString(16));
        this.registers.PC++;
        break;
      case "0x88": // ADC B
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.B.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x89": // ADC C
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.C.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x8a": // ADC D
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.D.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x8b": // ADC E
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.E.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x8c": // ADC H
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.H.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x8d": // ADC L
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.L.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x8e": // ADC M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.A = this._add(this.registers.A.toString(16), this.instructions[address].toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x8f": // ADC A
        this.registers.A = this._add(this.registers.A.toString(16), this.registers.A.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x90": // SUB B
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.B.toString(16));
        this.registers.PC++;
        break;
      case "0x91": // SUB C
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.C.toString(16));
        this.registers.PC++;
        break;
      case "0x92": // SUB D
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.D.toString(16));
        this.registers.PC++;
        break;
      case "0x93": // SUB E
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.E.toString(16));
        this.registers.PC++;
        break;
      case "0x94": // SUB H
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.H.toString(16));
        this.registers.PC++;
        break;
      case "0x95": // SUB L
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.L.toString(16));
        this.registers.PC++;
        break;
      case "0x96": // SUB M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.A = this._sub(this.registers.A.toString(16), this.instructions[address].toString(16));
        this.registers.PC++;
        break;
      case "0x97": // SUB A
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.A.toString(16));
        this.registers.PC++;
        break;
      case "0x98": // SBB B
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.B.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x99": // SBB C
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.C.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x9a": // SBB D
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.D.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x9b": // SBB E
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.E.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x9c": // SBB H
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.H.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x9d": // SBB L
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.L.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x9e": // SBB M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.A = this._sub(this.registers.A.toString(16), this.instructions[address].toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0x9f": // SBB A
        this.registers.A = this._sub(this.registers.A.toString(16), this.registers.A.toString(16), this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.PC++;
        break;
      case "0xa1": // ANA C
        this.registers.A &= this.registers.C;
        this._setFlagsOnLogicalOp(this.registers.A);
        this.registers.PC++;
        break;
      case "0xa2": // ANA D
        this.registers.A &= this.registers.D;
        this._setFlagsOnLogicalOp(this.registers.A);
        this.registers.PC++;
        break;
      case "0xa3": // ANA E
        this.registers.A &= this.registers.E;
        this._setFlagsOnLogicalOp(this.registers.A);
        this.registers.PC++;
        break;
      case "0xa4": // ANA H
        this.registers.A &= this.registers.H;
        this._setFlagsOnLogicalOp(this.registers.A);
        this.registers.PC++;
        break;
      case "0xa5": // ANA L
        this.registers.A &= this.registers.L;
        this._setFlagsOnLogicalOp(this.registers.A);
        this.registers.PC++;
        break;
      case "0xa6": // ANA M
        address = (this.registers.H << 8) | this.registers.L;
        this.registers.A &= this.instructions[address];
        this._setFlagsOnLogicalOp(this.registers.A);
        this.registers.PC++;
        break;
      case "0xa7": // ANA A
        this.registers.A &= this.registers.A;
        this._setFlagsOnLogicalOp(this.registers.A);
        this.registers.PC++;
        break;
      case "0xa8": // XRA B
        result = this.registers.A ^ this.registers.B;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xa9": // XRA C
        result = this.registers.A ^ this.registers.C;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xaa": // XRA D
        result = this.registers.A ^ this.registers.D;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xab": // XRA E
        result = this.registers.A ^ this.registers.E;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xac": // XRA H
        result = this.registers.A ^ this.registers.H;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xad": // XRA L
        result = this.registers.A ^ this.registers.L;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xae": // XRA M
        address = (this.registers.H << 8) | this.registers.L;
        result = this.registers.A ^ this.instructions[address];
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xaf": // XRA A
        result = this.registers.A ^ this.registers.A;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xb0": // ORA B
        result = this.registers.A | this.registers.B;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xb1": // ORA C
        result = this.registers.A | this.registers.C;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xb2": // ORA D
        result = this.registers.A | this.registers.D;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xb3": // ORA E
        result = this.registers.A | this.registers.E;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xb4": // ORA H
        result = this.registers.A | this.registers.H;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xb5": // ORA L
        result = this.registers.A | this.registers.L;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xb6": // ORA M
        address = (this.registers.H << 8) | this.registers.L;
        result = this.registers.A | this.instructions[address];
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xb7": // ORA A
        result = this.registers.A | this.registers.A;
        this._setFlagsOnLogicalOp(result);
        this.registers.A = result & 0xff;
        this.registers.PC++;
        break;
      case "0xb8": // CMP B
        this._sub(this.registers.A.toString(16), this.registers.B.toString(16));
        this.registers.PC++;
        break;
      case "0xb9": // CMP C
        this._sub(this.registers.A.toString(16), this.registers.C.toString(16));
        this.registers.PC++;
        break;
      case "0xba": // CMP D
        this._sub(this.registers.A.toString(16), this.registers.D.toString(16));
        this.registers.PC++;
        break;
      case "0xbb": // CMP E
        this._sub(this.registers.A.toString(16), this.registers.E.toString(16));
        this.registers.PC++;
        break;
      case "0xbc": // CMP H
        this._sub(this.registers.A.toString(16), this.registers.H.toString(16));
        this.registers.PC++;
        break;
      case "0xbd": // CMP L
        this._sub(this.registers.A.toString(16), this.registers.L.toString(16));
        this.registers.PC++;
        break;
      case "0xbe": // CMP M
        address = (this.registers.H << 8) | this.registers.L;
        this._sub(this.registers.A.toString(16), this.instructions[address].toString(16));
        this.registers.PC++;
        break;
      case "0xbf": // CMP A
        this._sub(this.registers.A.toString(16), this.registers.A.toString(16));
        this.registers.PC++;
        break;
      case "0xc0": // RNZ
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Zero)) {
          this.registers.PC = (this.instructions[this.registers.SP + 1] << 8) | this.instructions[this.registers.SP];
          this.registers.SP += 2;
        } else {
          this.registers.PC++;
        }
        break;
      case "0xc1": // POP B
        console.log(this.instructions[this.registers.SP + 1]);
        this.registers.C = this.instructions[this.registers.SP];
        this.registers.B = this.instructions[this.registers.SP + 1];
        this.registers.SP += 2;
        this.registers.PC++;
        break;
      case "0xc2": // JNZ adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Zero)) {
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
      case "0xc4": // CNZ adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Zero)) {
          const retAddress = this.registers.PC + 3;
          this.instructions[--this.registers.SP] = (retAddress >> 8) & 0xff;
          this.instructions[--this.registers.SP] = retAddress & 0xff;
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xc5": // PUSH B
        this.registers.SP -= 1;
        this.instructions[this.registers.SP] = this.registers.B;
        this.registers.SP -= 1;
        this.instructions[this.registers.SP] = this.registers.C;
        this.registers.PC++;
        break;
      case "0xc6": // ADI D8
        value = this.instructions[this.registers.PC + 1];
        result = this._add(this.registers.A.toString(16), value);
        this.registers.A = result;
        this.registers.PC += 2;
        break;
      case "0xc8": // RZ
        if (this._flagManager.IsSet(this._flagManager.FlagType.Zero)) {
          this.registers.PC = (this.instructions[this.registers.SP + 1] << 8) | this.instructions[this.registers.SP];
          this.registers.SP += 2;
        } else {
          this.registers.PC++;
        }
        break;
      case "0xc9": // RET
        // Pop the return address from the stack
        lowByte = this.instructions[this.registers.SP++];
        highByte = this.instructions[this.registers.SP++];
        this.registers.PC = (highByte << 8) | lowByte;
        break;
      case "0xca": // JZ adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (this._flagManager.IsSet(this._flagManager.FlagType.Zero)) {
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xcc": // CZ adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (this._flagManager.IsSet(this._flagManager.FlagType.Zero)) {
          const retAddress = this.registers.PC + 3;
          this.instructions[--this.registers.SP] = (retAddress >> 8) & 0xff;
          this.instructions[--this.registers.SP] = retAddress & 0xff;
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xcd": // CALL address
        const callAddress =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (callAddress == 5) {
          if (this.registers.C == 9) {
            console.log(
              logger(
                instruction,
                this.instructions,
                this.registers.PC,
                this.registers
              )
            );
            let straddr = (this.registers.D << 8) | this.registers.E;
            let ret_str = "";
            let next_char = String.fromCharCode(this.instructions[straddr + 3]);
            while (next_char != "$") {
              ret_str += next_char;
              straddr++;
              next_char = String.fromCharCode(this.instructions[straddr]);
            }
            console.log(ret_str);
            throw new Error("Program error");
          }
        } else if (callAddress == 0) {
          console.log("Exiting...");
          process.exit(0);
        }
        // Push the return address onto the instructions
        const retAddress = this.registers.PC + 3;
        this.instructions[--this.registers.SP] = (retAddress >> 8) & 0xff;
        this.instructions[--this.registers.SP] = retAddress & 0xff;
        // Jump to the call address
        this.registers.PC = callAddress;
        break;
      case "0xce": // ACI D8
        value = this.instructions[this.registers.PC + 1];
        result = this._add(this.registers.A.toString(16), value, this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.A = result;
        this.registers.PC += 2;
        break;
      case "0xd0": // RNC
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Carry)) {
          this.registers.PC = (this.instructions[this.registers.SP + 1] << 8) | this.instructions[this.registers.SP];
          this.registers.SP += 2;
        } else {
          this.registers.PC += 1;
        }
        break;
      case "0xd1": // POP D
        this.registers.E = this.instructions[this.registers.SP];
        this.registers.D = this.instructions[this.registers.SP + 1];
        this.registers.SP += 2;
        this.registers.PC++;
        break;
      case "0xd2": // JNC adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Carry)) {
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xd3": // OUT D8
        this.registers.PC += 2;
        break;
      case "0xd4": // CNC adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Carry)) {
          const retAddress = this.registers.PC + 3;
          this.instructions[--this.registers.SP] = (retAddress >> 8) & 0xff;
          this.instructions[--this.registers.SP] = retAddress & 0xff;
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xd5": // PUSH D
        this.registers.SP -= 1;
        this.instructions[this.registers.SP] = this.registers.D;
        this.registers.SP -= 1;
        this.instructions[this.registers.SP] = this.registers.E;
        this.registers.PC++;
        break;
      case "0xd6": // SUI D8
        value = this.instructions[this.registers.PC + 1];
        result = this._sub(this.registers.A.toString(16), value);
        this.registers.A = result;
        this.registers.PC += 2;
        break;
      case "0xd8": // RC
        if (this._flagManager.IsSet(this._flagManager.FlagType.Carry)) {
          this.registers.PC = (this.instructions[this.registers.SP + 1] << 8) | this.instructions[this.registers.SP];
          this.registers.SP += 2;
        } else {
          this.registers.PC += 1;
        }
        break;
      case "0xda": // JC adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (this._flagManager.IsSet(this._flagManager.FlagType.Carry)) {
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xdc": // CC adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (this._flagManager.IsSet(this._flagManager.FlagType.Carry)) {
          const retAddress = this.registers.PC + 3;
          this.instructions[--this.registers.SP] = (retAddress >> 8) & 0xff;
          this.instructions[--this.registers.SP] = retAddress & 0xff;
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xde": // SBI D8
        value = this.instructions[this.registers.PC + 1];
        result = this._sub(this.registers.A.toString(16), value, this._flagManager.IsSet(this._flagManager.FlagType.Carry) ? 1 : 0);
        this.registers.A = result;
        this.registers.PC += 2;
        break;
      case "0xe0": // RPO
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Parity)) {
          this.registers.PC = (this.instructions[this.registers.SP + 1] << 8) | this.instructions[this.registers.SP];
          this.registers.SP += 2;
        } else {
          this.registers.PC += 1;
        }
        break;
      case "0xe1": // POP H
        this.registers.L = this.instructions[this.registers.SP];
        this.registers.H = this.instructions[this.registers.SP + 1];
        this.registers.SP += 2;
        this.registers.PC++;
        break;
      case "0xe2": // JPO adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];

        // Check the parity flag: jump if parity flag is not set (i.e., parity is odd)
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Parity)) {
          this.registers.PC = address; // Perform the jump
        } else {
          this.registers.PC += 3; // Move to the next instruction if parity is even
        }
        break;
      case "0xe3": // XTHL
        lowByte = this.instructions[this.registers.SP];
        highByte = this.instructions[this.registers.SP + 1];
        this.instructions[this.registers.SP] = this.registers.L;
        this.instructions[this.registers.SP + 1] = this.registers.H;
        this.registers.L = lowByte;
        this.registers.H = highByte;
        this.registers.PC++;
        break;
      case "0xe4": // CPO adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Parity)) {
          const retAddress = this.registers.PC + 3;
          this.instructions[--this.registers.SP] = (retAddress >> 8) & 0xff;
          this.instructions[--this.registers.SP] = retAddress & 0xff;
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xe5": // PUSH H
        this.registers.SP -= 1;
        this.instructions[this.registers.SP] = this.registers.H;
        this.registers.SP -= 1;
        this.instructions[this.registers.SP] = this.registers.L;
        this.registers.PC++;
        break;
      case "0xe6": // ANI D8
        value = this.instructions[this.registers.PC + 1];
        this.registers.A &= value;
        this.registers.A &= 0xFF;
        this._setFlagsOnLogicalOp(this.registers.A);
        this.registers.PC += 2;
        break;
      case "0xe8": // RPE
        if (this._flagManager.IsSet(this._flagManager.FlagType.Parity)) {
          this.registers.PC = (this.instructions[this.registers.SP + 1] << 8) | this.instructions[this.registers.SP];
          this.registers.SP += 2;
        } else {
          this.registers.PC += 1;
        }
        break;
      case "0xe9": // PCHL
        this.registers.PC = (this.registers.H << 8) | this.registers.L;
        break;
      case "0xea": // JPE adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (this._flagManager.IsSet(this._flagManager.FlagType.Parity)) {
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xeb": // XCHG
        tempD = this.registers.D;
        tempE = this.registers.E;
        this.registers.D = this.registers.H;
        this.registers.E = this.registers.L;
        this.registers.H = tempD;
        this.registers.L = tempE;
        this.registers.PC++;
        break;
      case "0xec": // CPE adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (this._flagManager.IsSet(this._flagManager.FlagType.Parity)) {
          const retAddress = this.registers.PC + 3;
          this.instructions[--this.registers.SP] = (retAddress >> 8) & 0xff;
          this.instructions[--this.registers.SP] = retAddress & 0xff;
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xee": // XRI D8
        value = this.instructions[this.registers.PC + 1];
        this.registers.A ^= value;
        this._setFlagsOnLogicalOp(this.registers.A);
        this.registers.PC += 2;
        break;
      case "0xf0": // RP
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Sign)) {
          this.registers.PC = (this.instructions[this.registers.SP + 1] << 8) | this.instructions[this.registers.SP];
          this.registers.SP += 2;
        } else {
          this.registers.PC += 1;
        }
        break;
      case "0xf1": // POP PSW
        this._flags = this.instructions[this.registers.SP];
        this.registers.A = this.instructions[this.registers.SP + 1];
        this.registers.SP += 2;
        this.registers.PC++;
        break;
      case "0xf2": // JP adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Sign)) {
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xf4": // CP adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (!this._flagManager.IsSet(this._flagManager.FlagType.Sign)) {
          const retAddress = this.registers.PC + 3;
          this.instructions[--this.registers.SP] = (retAddress >> 8) & 0xff;
          this.instructions[--this.registers.SP] = retAddress & 0xff;
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xf5": // PUSH PSW
        this.registers.SP -= 1;
        this.instructions[this.registers.SP] = this.registers.A;
        this.registers.SP -= 1;
        this.instructions[this.registers.SP] = this._flags;
        this.registers.PC++;
        break;
      case "0xf6": // ORI D8
        value = this.instructions[this.registers.PC + 1];
        this.registers.A |= value;
        this._setFlagsOnLogicalOp(this.registers.A);
        this.registers.PC += 2;
        break;
      case "0xf8": // RM
        if (this._flagManager.IsSet(this._flagManager.FlagType.Sign)) {
          this.registers.PC = (this.instructions[this.registers.SP + 1] << 8) | this.instructions[this.registers.SP];
          this.registers.SP += 2;
        } else {
          this.registers.PC += 1;
        }
        break;
      case "0xf9": // SPHL
        this.registers.SP = (this.registers.H << 8) | this.registers.L;
        this.registers.PC++;
        break;
      case "0xfa": // JM adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (this._flagManager.IsSet(this._flagManager.FlagType.Sign)) {
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xfb": // EI
        this.interruptsEnabled = 1;
        this.registers.PC++;
        break;
      case "0xfc": // CM adr
        address =
          (this.instructions[this.registers.PC + 2] << 8) |
          this.instructions[this.registers.PC + 1];
        if (this._flagManager.IsSet(this._flagManager.FlagType.Sign)) {
          const retAddress = this.registers.PC + 3;
          this.instructions[--this.registers.SP] = (retAddress >> 8) & 0xff;
          this.instructions[--this.registers.SP] = retAddress & 0xff;
          this.registers.PC = address;
        } else {
          this.registers.PC += 3;
        }
        break;
      case "0xfe": // CPI D8
        value = this.instructions[this.registers.PC + 1];
        result = this._sub(this.registers.A.toString(16), value);
        this.registers.PC += 2;
        break;
      default:
        console.log("Unimplemented instruction:", instruction);
        throw new Error("Unimplemented instruction");
    }
  }
}

const emulator = new Emulator();
emulator.gameLoop();
