// const fs = require("fs");
// const path = require('path');

export class Disassembler {
    constructor() {
      this.instructions = [];
    }
  
    // Load the instructions from a file
    loadInstructions(filename) {
      const data = fs.readFileSync(filename);
      const hexData = data.toString("hex");
      this.instructions = this.parseHexData(hexData);
      return this.instructions;
    }
  
    // Parse the hex data and return the instructions as an array of strings
    parseHexData(hexData) {
      const instructions = [];
      for (let i = 0; i < hexData.length; i += 2) {
        instructions.push(hexData.substr(i, 2));
      }
  
      let index = 0;
      while (index < instructions.length) {
        const instruction = instructions[index];
        switch (instruction) {
          case "00":
            console.log(`NOP`);
            index++;
            break;
          case "01":
            console.log(
              `LXI B, ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "02":
            console.log(`STAX B`);
            index++;
            break;
          case "03":
            console.log(`INX B`);
            index++;
            break;
          case "04":
            console.log(`INR B`);
            index++;
            break;
          case "05":
            console.log(`DCR B`);
            index++;
            break;
          case "06":
            console.log(`MVI B, ${instructions[index + 1]}`);
            index += 2;
            break;
          case "07":
            console.log(`RLC`);
            index++;
            break;
          case "08":
            console.log(`NOP`);
            index++;
            break;
          case "09":
            console.log(`DAD B`);
            index++;
            break;
          case "0a":
            console.log(`LDAX B`);
            index++;
            break;
          case "0b":
            console.log(`DCX B`);
            index++;
            break;
          case "0c":
            console.log(`INR C`);
            index++;
            break;
          case "0d":
            console.log(`DCR C`);
            index++;
            break;
          case "0e":
            console.log(`MVI C, ${instructions[index + 1]}`);
            index += 2;
            break;
          case "0f":
            console.log(`RRC`);
            index++;
            break;
          case "10":
            console.log(`NOP`);
            index++;
            break;
          case "11":
            console.log(
              `LXI D, ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "12":
            console.log(`STAX D`);
            index++;
            break;
          case "13":
            console.log(`INX D`);
            index++;
            break;
          case "14":
            console.log(`INR D`);
            index++;
            break;
          case "15":
            console.log(`DCR D`);
            index++;
            break;
          case "16":
            console.log(`MVI D, ${instructions[index + 1]}`);
            index += 2;
            break;
          case "17":
            console.log(`RAL`);
            index++;
            break;
          case "18":
            console.log(`NOP`);
            index++;
            break;
          case "19":
            console.log(`DAD D`);
            index++;
            break;
          case "1a":
            console.log(`LDAX D`);
            index++;
            break;
          case "1b":
            console.log(`DCX D`);
            index++;
            break;
          case "1c":
            console.log(`INR E`);
            index++;
            break;
          case "1d":
            console.log(`DCR E`);
            index++;
            break;
          case "1e":
            console.log(`MVI E, ${instructions[index + 1]}`);
            index += 2;
            break;
          case "1f":
            console.log(`RAR`);
            index++;
            break;
          case "20":
            console.log(`NOP`);
            index++;
            break;
          case "21":
            console.log(
              `LXI H, ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "22":
            console.log(
              `SHLD ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "23":
            console.log(`INX H`);
            index++;
            break;
          case "24":
            console.log(`INR H`);
            index++;
            break;
          case "25":
            console.log(`DCR H`);
            index++;
            break;
          case "26":
            console.log(`MVI H, ${instructions[index + 1]}`);
            index += 2;
            break;
          case "27":
            console.log(`DAA`);
            index++;
            break;
          case "28":
            console.log(`NOP`);
            index++;
            break;
          case "29":
            console.log(`DAD H`);
            index++;
            break;
          case "2a":
            console.log(
              `LHLD ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "2b":
            console.log(`DCX H`);
            index++;
            break;
          case "2c":
            console.log(`INR L`);
            index++;
            break;
          case "2d":
            console.log(`DCR L`);
            index++;
            break;
          case "2e":
            console.log(`MVI L, ${instructions[index + 1]}`);
            index += 2;
            break;
          case "2f":
            console.log(`CMA`);
            index++;
            break;
          case "30":
            console.log(`NOP`);
            index++;
            break;
          case "31":
            console.log(
              `LXI SP, ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "32":
            console.log(
              `STA ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "33":
            console.log(`INX SP`);
            index++;
            break;
          case "34":
            console.log(`INR M`);
            index++;
            break;
          case "35":
            console.log(`DCR M`);
            index++;
            break;
          case "36":
            console.log(`MVI M, ${instructions[index + 1]}`);
            index += 2;
            break;
          case "37":
            console.log(`STC`);
            index++;
            break;
          case "38":
            console.log(`NOP`);
            index++;
            break;
          case "39":
            console.log(`DAD SP`);
            index++;
            break;
          case "3a":
            console.log(
              `LDA ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "3b":
            console.log(`DCX SP`);
            index++;
            break;
          case "3c":
            console.log(`INR A`);
            index++;
            break;
          case "3d":
            console.log(`DCR A`);
            index++;
            break;
          case "3e":
            console.log(`MVI A, ${instructions[index + 1]}`);
            index += 2;
            break;
          case "3f":
            console.log(`CMC`);
            index++;
            break;
          case "40":
            console.log(`MOV B, B`);
            index++;
            break;
          case "41":
            console.log(`MOV B, C`);
            index++;
            break;
          case "42":
            console.log(`MOV B, D`);
            index++;
            break;
          case "43":
            console.log(`MOV B, E`);
            index++;
            break;
          case "44":
            console.log(`MOV B, H`);
            index++;
            break;
          case "45":
            console.log(`MOV B, L`);
            index++;
            break;
          case "46":
            console.log(`MOV B, M`);
            index++;
            break;
          case "47":
            console.log(`MOV B, A`);
            index++;
            break;
          case "48":
            console.log(`MOV C, B`);
            index++;
            break;
          case "49":
            console.log(`MOV C, C`);
            index++;
            break;
          case "4a":
            console.log(`MOV C, D`);
            index++;
            break;
          case "4b":
            console.log(`MOV C, E`);
            index++;
            break;
          case "4c":
            console.log(`MOV C, H`);
            index++;
            break;
          case "4d":
            console.log(`MOV C, L`);
            index++;
            break;
          case "4e":
            console.log(`MOV C, M`);
            index++;
            break;
          case "4f":
            console.log(`MOV C, A`);
            index++;
            break;
          case "50":
            console.log(`MOV D, B`);
            index++;
            break;
          case "51":
            console.log(`MOV D, C`);
            index++;
            break;
          case "52":
            console.log(`MOV D, D`);
            index++;
            break;
          case "53":
            console.log(`MOV D, E`);
            index++;
            break;
          case "54":
            console.log(`MOV D, H`);
            index++;
            break;
          case "55":
            console.log(`MOV D, L`);
            index++;
            break;
          case "56":
            console.log(`MOV D, M`);
            index++;
            break;
          case "57":
            console.log(`MOV D, A`);
            index++;
            break;
          case "58":
            console.log(`MOV E, B`);
            index++;
            break;
          case "59":
            console.log(`MOV E, C`);
            index++;
            break;
          case "5a":
            console.log(`MOV E, D`);
            index++;
            break;
          case "5b":
            console.log(`MOV E, E`);
            index++;
            break;
          case "5c":
            console.log(`MOV E, H`);
            index++;
            break;
          case "5d":
            console.log(`MOV E, L`);
            index++;
            break;
          case "5e":
            console.log(`MOV E, M`);
            index++;
            break;
          case "5f":
            console.log(`MOV E, A`);
            index++;
            break;
          case "60":
            console.log(`MOV H, B`);
            index++;
            break;
          case "61":
            console.log(`MOV H, C`);
            index++;
            break;
          case "62":
            console.log(`MOV H, D`);
            index++;
            break;
          case "63":
            console.log(`MOV H, E`);
            index++;
            break;
          case "64":
            console.log(`MOV H, H`);
            index++;
            break;
          case "65":
            console.log(`MOV H, L`);
            index++;
            break;
          case "66":
            console.log(`MOV H, M`);
            index++;
            break;
          case "67":
            console.log(`MOV H, A`);
            index++;
            break;
          case "68":
            console.log(`MOV L, B`);
            index++;
            break;
          case "69":
            console.log(`MOV L, C`);
            index++;
            break;
          case "6a":
            console.log(`MOV L, D`);
            index++;
            break;
          case "6b":
            console.log(`MOV L, E`);
            index++;
            break;
          case "6c":
            console.log(`MOV L, H`);
            index++;
            break;
          case "6d":
            console.log(`MOV L, L`);
            index++;
            break;
          case "6e":
            console.log(`MOV L, M`);
            index++;
            break;
          case "6f":
            console.log(`MOV L, A`);
            index++;
            break;
          case "70":
            console.log(`MOV M, B`);
            index++;
            break;
          case "71":
            console.log(`MOV M, C`);
            index++;
            break;
          case "72":
            console.log(`MOV M, D`);
            index++;
            break;
          case "73":
            console.log(`MOV M, E`);
            index++;
            break;
          case "74":
            console.log(`MOV M, H`);
            index++;
            break;
          case "75":
            console.log(`MOV M, L`);
            index++;
            break;
          case "76":
            console.log(`HLT`);
            index++;
            break;
          case "77":
            console.log(`MOV M, A`);
            index++;
            break;
          case "78":
            console.log(`MOV A, B`);
            index++;
            break;
          case "79":
            console.log(`MOV A, C`);
            index++;
            break;
          case "7a":
            console.log(`MOV A, D`);
            index++;
            break;
          case "7b":
            console.log(`MOV A, E`);
            index++;
            break;
          case "7c":
            console.log(`MOV A, H`);
            index++;
            break;
          case "7d":
            console.log(`MOV A, L`);
            index++;
            break;
          case "7e":
            console.log(`MOV A, M`);
            index++;
            break;
          case "7f":
            console.log(`MOV A, A`);
            index++;
            break;
          case "80":
            console.log(`ADD B`);
            index++;
            break;
          case "81":
            console.log(`ADD C`);
            index++;
            break;
          case "82":
            console.log(`ADD D`);
            index++;
            break;
          case "83":
            console.log(`ADD E`);
            index++;
            break;
          case "84":
            console.log(`ADD H`);
            index++;
            break;
          case "85":
            console.log(`ADD L`);
            index++;
            break;
          case "86":
            console.log(`ADD M`);
            index++;
            break;
          case "87":
            console.log(`ADD A`);
            index++;
            break;
          case "88":
            console.log(`ADC B`);
            index++;
            break;
          case "89":
            console.log(`ADC C`);
            index++;
            break;
          case "8a":
            console.log(`ADC D`);
            index++;
            break;
          case "8b":
            console.log(`ADC E`);
            index++;
            break;
          case "8c":
            console.log(`ADC H`);
            index++;
            break;
          case "8d":
            console.log(`ADC L`);
            index++;
            break;
          case "8e":
            console.log(`ADC M`);
            index++;
            break;
          case "8f":
            console.log(`ADC A`);
            index++;
            break;
          case "90":
            console.log(`SUB B`);
            index++;
            break;
          case "91":
            console.log(`SUB C`);
            index++;
            break;
          case "92":
            console.log(`SUB D`);
            index++;
            break;
          case "93":
            console.log(`SUB E`);
            index++;
            break;
          case "94":
            console.log(`SUB H`);
            index++;
            break;
          case "95":
            console.log(`SUB L`);
            index++;
            break;
          case "96":
            console.log(`SUB M`);
            index++;
            break;
          case "97":
            console.log(`SUB A`);
            index++;
            break;
          case "98":
            console.log(`SBB B`);
            index++;
            break;
          case "99":
            console.log(`SBB C`);
            index++;
            break;
          case "9a":
            console.log(`SBB D`);
            index++;
            break;
          case "9b":
            console.log(`SBB E`);
            index++;
            break;
          case "9c":
            console.log(`SBB H`);
            index++;
            break;
          case "9d":
            console.log(`SBB L`);
            index++;
            break;
          case "9e":
            console.log(`SBB M`);
            index++;
            break;
          case "9f":
            console.log(`SBB A`);
            index++;
            break;
          case "a0":
            console.log(`ANA B`);
            index++;
            break;
          case "a1":
            console.log(`ANA C`);
            index++;
            break;
          case "a2":
            console.log(`ANA D`);
            index++;
            break;
          case "a3":
            console.log(`ANA E`);
            index++;
            break;
          case "a4":
            console.log(`ANA H`);
            index++;
            break;
          case "a5":
            console.log(`ANA L`);
            index++;
            break;
          case "a6":
            console.log(`ANA M`);
            index++;
            break;
          case "a7":
            console.log(`ANA A`);
            index++;
            break;
          case "a8":
            console.log(`XRA B`);
            index++;
            break;
          case "a9":
            console.log(`XRA C`);
            index++;
            break;
          case "aa":
            console.log(`XRA D`);
            index++;
            break;
          case "ab":
            console.log(`XRA E`);
            index++;
            break;
          case "ac":
            console.log(`XRA H`);
            index++;
            break;
          case "ad":
            console.log(`XRA L`);
            index++;
            break;
          case "ae":
            console.log(`XRA M`);
            index++;
            break;
          case "af":
            console.log(`XRA A`);
            index++;
            break;
          case "b0":
            console.log(`ORA B`);
            index++;
            break;
          case "b1":
            console.log(`ORA C`);
            index++;
            break;
          case "b2":
            console.log(`ORA D`);
            index++;
            break;
          case "b3":
            console.log(`ORA E`);
            index++;
            break;
          case "b4":
            console.log(`ORA H`);
            index++;
            break;
          case "b5":
            console.log(`ORA L`);
            index++;
            break;
          case "b6":
            console.log(`ORA M`);
            index++;
            break;
          case "b7":
            console.log(`ORA A`);
            index++;
            break;
          case "b8":
            console.log(`CMP B`);
            index++;
            break;
          case "b9":
            console.log(`CMP C`);
            index++;
            break;
          case "ba":
            console.log(`CMP D`);
            index++;
            break;
          case "bb":
            console.log(`CMP E`);
            index++;
            break;
          case "bc":
            console.log(`CMP H`);
            index++;
            break;
          case "bd":
            console.log(`CMP L`);
            index++;
            break;
          case "be":
            console.log(`CMP M`);
            index++;
            break;
          case "bf":
            console.log(`CMP A`);
            index++;
            break;
          case "c0":
            console.log(`RNZ`);
            index++;
            break;
          case "c1":
            console.log(`POP B`);
            index++;
            break;
          case "c2":
            console.log(
              `JNZ ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "c3":
            console.log(
              `JMP ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "c4":
            console.log(
              `CNZ ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "c5":
            console.log(`PUSH B`);
            index++;
            break;
          case "c6":
            console.log(`ADI ${instructions[index + 1]}`);
            index += 2;
            break;
          case "c7":
            console.log(`RST 0`);
            index++;
            break;
          case "c8":
            console.log(`RZ`);
            index++;
            break;
          case "c9":
            console.log(`RET`);
            index++;
            break;
          case "ca":
            console.log(
              `JZ ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "cb":
            console.log(`NOP`);
            index++;
            break;
          case "cc":
            console.log(
              `CZ ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "cd":
            console.log(
              `CALL ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "ce":
            console.log(`ACI ${instructions[index + 1]}`);
            index += 2;
            break;
          case "cf":
            console.log(`RST 1`);
            index++;
            break;
          case "d0":
            console.log(`RNC`);
            index++;
            break;
          case "d1":
            console.log(`POP D`);
            index++;
            break;
          case "d2":
            console.log(
              `JNC ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "d3":
            console.log(`OUT ${instructions[index + 1]}`);
            index += 2;
            break;
          case "d4":
            console.log(
              `CNC ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "d5":
            console.log(`PUSH D`);
            index++;
            break;
          case "d6":
            console.log(`SUI ${instructions[index + 1]}`);
            index += 2;
            break;
          case "d7":
            console.log(`RST 2`);
            index++;
            break;
          case "d8":
            console.log(`RC`);
            index++;
            break;
          case "d9":
            console.log(`NOP`);
            index++;
            break;
          case "da":
            console.log(
              `JC ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "db":
            console.log(`IN ${instructions[index + 1]}`);
            index += 2;
            break;
          case "dc":
            console.log(
              `CC ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "dd":
            console.log(`NOP`);
            index++;
            break;
          case "de":
            console.log(`SBI ${instructions[index + 1]}`);
            index += 2;
            break;
          case "df":
            console.log(`RST 3`);
            index++;
            break;
          case "e0":
            console.log(`RPO`);
            index++;
            break;
          case "e1":
            console.log(`POP H`);
            index++;
            break;
          case "e2":
            console.log(
              `JPO ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "e3":
            console.log(`XTHL`);
            index++;
            break;
          case "e4":
            console.log(
              `CPO ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "e5":
            console.log(`PUSH H`);
            index++;
            break;
          case "e6":
            console.log(`ANI ${instructions[index + 1]}`);
            index += 2;
            break;
          case "e7":
            console.log(`RST 4`);
            index++;
            break;
          case "e8":
            console.log(`RPE`);
            index++;
            break;
          case "e9":
            console.log(`PCHL`);
            index++;
            break;
          case "ea":
            console.log(
              `JPE ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "eb":
            console.log(`XCHG`);
            index++;
            break;
          case "ec":
            console.log(
              `CPE ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "ed":
            console.log(`NOP`);
            index++;
            break;
          case "ee":
            console.log(`XRI ${instructions[index + 1]}`);
            index += 2;
            break;
          case "ef":
            console.log(`RST 5`);
            index++;
            break;
          case "f0":
            console.log(`RP`);
            index++;
            break;
          case "f1":
            console.log(`POP PSW`);
            index++;
            break;
          case "f2":
            console.log(
              `JP ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "f3":
            console.log(`DI`);
            index++;
            break;
          case "f4":
            console.log(
              `CP ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "f5":
            console.log(`PUSH PSW`);
            index++;
            break;
          case "f6":
            console.log(`ORI ${instructions[index + 1]}`);
            index += 2;
            break;
          case "f7":
            console.log(`RST 6`);
            index++;
            break;
          case "f8":
            console.log(`RM`);
            index++;
            break;
          case "f9":
            console.log(`SPHL`);
            index++;
            break;
          case "fa":
            console.log(
              `JM ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "fb":
            console.log(`EI`);
            index++;
            break;
          case "fc":
            console.log(
              `CM ${instructions[index + 2]}${instructions[index + 1]}`
            );
            index += 3;
            break;
          case "fd":
            console.log(`NOP`);
            index++;
            break;
          case "fe":
            console.log(`CPI ${instructions[index + 1]}`);
            index += 2;
            break;
          case "ff":
            console.log(`RST 7`);
            index++;
            break;
          default:
            console.log(`Unknown instruction: ${instruction}`);
            index++;
            break;
        }
      }
      return instructions;
    }
  }

// const disassembler = new Disassembler();
// disassembler.loadInstructions("si.rom");