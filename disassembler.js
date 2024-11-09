const fs = require("fs");
const path = require('path');

class Disassembler {
    constructor() {
        this.instructions = [];
    }

    // Load the instructions from a file starting at a specific address
    loadInstructions(filename, startAddress) {
        const data = fs.readFileSync(filename);
        const hexData = data.toString("hex");
        const instructions = this.parseHexData(hexData);
        for (let i = 0; i < instructions.length; i++) {
            this.instructions[startAddress + i] = `0x${instructions[i]}`;
        }
    }

    // Parse the hex data and return the instructions as an array of strings
    parseHexData(hexData) {
        const instructions = [];
        for (let i = 0; i < hexData.length; i += 2) {
            instructions.push(hexData.substr(i, 2));
        }
        return instructions;
    }

    // Load all programs and store instructions in a single array
    loadPrograms() {
        this.loadInstructions("./invaders.h", 0x0);
        this.loadInstructions("./invaders.g", 0x0800);
        this.loadInstructions("./invaders.f", 0x1000);
        this.loadInstructions("./invaders.e", 0x1800);
    }

    // Write the combined instructions to a new file in array format
    writeInstructionsToFile(outputFilename) {
        const outputData = `export const instructions = [\n    ${this.instructions.map(instr => `"${instr}"`).join(",\n    ")}\n];\n`;
        fs.writeFileSync(outputFilename, outputData);
    }
}

const disassembler = new Disassembler();
disassembler.loadPrograms();
disassembler.writeInstructionsToFile("./combined_instructions.js");
console.log("Instructions written to combined_instructions.js");