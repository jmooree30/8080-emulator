import { lookup } from "./instructionLookup.js";

export const logger = (opcode, instructions, programCounter, registers, flagManager) => {
    let resultOP;
    let resultBytes;
    let result;
    lookup.forEach((instruction) => {
        if (instruction.opcode === opcode) {
            resultOP = instruction.instruction;
            resultBytes = instruction.bytes;
            if (resultBytes === 1) {
                result = `${resultOP}`;
            } else if (resultBytes === 2) {
                result = `${resultOP} ${instructions[programCounter + 1]}`;
            } else if (resultBytes === 3) {
                result = `${resultOP} ${instructions[programCounter + 1]} ${instructions[programCounter + 2]}`;
            }
        }
    });

    let flags = {
        Carry: flagManager?.IsSet(flagManager.FlagType.Carry),
        Parity: flagManager?.IsSet(flagManager.FlagType.Parity),
        AuxillaryCarry: flagManager?.IsSet(flagManager.FlagType.AuxillaryCarry),
        Zero: flagManager?.IsSet(flagManager.FlagType.Zero),
        Sign: flagManager?.IsSet(flagManager.FlagType.Sign),
    };

    let regs = `A:${registers.A.toString(16).toUpperCase()} B:${registers.B.toString(16).toUpperCase()} C:${registers.C.toString(16).toUpperCase()} D:${registers.D.toString(16).toUpperCase()} E:${registers.E.toString(16).toUpperCase()} H:${registers.H.toString(16).toUpperCase()} L:${registers.L.toString(16).toUpperCase()} SP:${registers.SP.toString(16).toUpperCase()} PC:${programCounter.toString(16).toUpperCase()}\nZ:${flags.Zero} S:${flags.Sign} P:${flags.Parity} CY:${flags.Carry} AC:${flags.AuxillaryCarry}\n`;

    result = `${regs}Instruction: ${result}\nOpcode: ${opcode}\n`;
    return result;
};