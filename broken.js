  // // Execute the instruction
  // executeInstruction(instruction) {
  //   let address;
  //   let hl;
  //   let result;
  //   let de;
  //   let value;
  //   let psw;
  //   let bc;
  //   let subResult;
  //   let addResult;
  //   switch (instruction) {
  //     // NOP
  //     case "00":
  //       this.registers.PC++;
  //       break;

  //     // LXI B, D16
  //     // Load the 16-bit data into the B and C registers
  //     case "01":
  //       this.registers.C = this.instructions[this.registers.PC + 1];
  //       this.registers.B = this.instructions[this.registers.PC + 2];
  //       this.registers.PC += 3;
  //       break;

  //     // STAX B
  //     // Store the A register at the BC address
  //     case "02":
  //       address = (this.registers.B << 8) | this.registers.C;
  //       console.log("STAX B address", address, "Hex", address.toString(16));
  //       this.memory[address] = this.registers.A;
  //       this.registers.PC++;
  //       break;

  //     // INX B
  //     // Increment the BC register pair
  //     case "03":
  //       bc = (this.registers.B << 8) | this.registers.C;
  //       bc++;
  //       this.registers.B = (bc & 0xff00) >> 8;
  //       this.registers.C = bc & 0x00ff;
  //       this.registers.PC++;
  //       break;

  //     // INR B
  //     case "04":
  //       // Increment B and apply a mask to ensure it remains 8 bits
  //       this.registers.B = (this.registers.B + 1) & 0xFF; // Mask to 8 bits
  //       this.registers.PC++;
  //       // Set the flags based on the new value of B
  //       this.registers.flags.Z = this.registers.B === 0 ? 1 : 0; // Zero flag
  //       this.registers.flags.S = this.registers.B & 0x80 ? 1 : 0; // Sign flag
  //       this.registers.flags.AC = (this.registers.B & 0x0F) === 0x00 ? 1 : 0; // Auxiliary carry flag
  //       this.registers.flags.P = this.calculateParity(this.registers.B); // Parity flag
  //       break;

  //     // DCR B
  //     // Decrement the B register
  //     // Set the flags based on the result
  //     case "05":
  //       this.registers.B = (this.registers.B - 1) & 0xff;
  //       this.registers.PC++;
  //       this.registers.flags.Z = this.registers.B === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.B & 0x80 ? 1 : 0;
  //       this.registers.flags.AC = (this.registers.B & 0x0f) === 0x0f ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.B);
  //       break;

  //     // MVI B, D8
  //     // Load the 8-bit data into the B register
  //     case "06":
  //       this.registers.B = this.instructions[this.registers.PC + 1];
  //       this.registers.PC += 2;
  //       break;

  //     // RLC
  //     // Rotate the A register left
  //     // The carry flag is set to the most significant bit of the A register
  //     case "07":
  //       this.registers.flags.CY = (this.registers.A & 0x80) >> 7; // Set carry flag to MSB of A
  //       this.registers.A = ((this.registers.A << 1) & 0xFE) | this.registers.flags.CY; // Rotate left
  //       this.registers.PC++;
  //       break;

  //     // NOP
  //     case "08":
  //       this.registers.PC++;
  //       break;

  //     // DAD B
  //     case "09":
  //       bc = (this.registers.B << 8) | this.registers.C; // Combine B and C
  //       hl = (this.registers.H << 8) | this.registers.L; // Combine H and L
  //       result = hl + bc; // Add HL and BC
  //       // Update H and L with the result
  //       this.registers.H = (result >> 8) & 0xFF; // Upper byte
  //       this.registers.L = result & 0xFF;       // Lower byte
  //       // Set carry flag if there's an overflow
  //       this.registers.flags.CY = result > 0xFFFF ? 1 : 0; // Carry flag (CY)
  //       this.registers.flags.AC = ((hl & 0x0F) + (de & 0x0F)) > 0x0F ? 1 : 0; // Auxiliary carry flag (AC)
  //       this.registers.PC++; // Move to the next instruction
  //       break;

  //     // LDAX B
  //     // Load the A register with the value at the BC address
  //     case "0a":
  //       address = (this.registers.B << 8) | this.registers.C; // Combine B and C to form the address
  //       this.registers.A = this.memory[address]; // Load the value from memory into A
  //       this.registers.PC++; // Increment PC
  //       break;

  //     // DCX B
  //     // Decrement the BC register pair
  //     case "0b":
  //       bc = (this.registers.B << 8) | this.registers.C; // Combine B and C
  //       bc--; // Decrement BC
  //       this.registers.B = (bc >> 8) & 0xFF; // Upper byte
  //       this.registers.C = bc & 0x00FF; // Lower byte
  //       this.registers.PC++; // Increment PC
  //       break;

  //     // INR C
  //     // Increment the C register
  //     case "0c":
  //       this.registers.C = (this.registers.C + 1) & 0xFF; // Increment C and mask to 8 bits
  //       this.registers.PC++; // Increment PC
  //       this.registers.flags.Z = (this.registers.C === 0) ? 1 : 0; // Zero flag
  //       this.registers.flags.S = (this.registers.C & 0x80) ? 1 : 0; // Sign flag
  //       this.registers.flags.AC = (this.registers.C & 0x0F) === 0 ? 1 : 0; // Auxiliary carry flag
  //       this.registers.flags.P = this.calculateParity(this.registers.C); // Parity flag
  //       break;

  //     // DCR C
  //     // Decrement the C register
  //     case "0d":
  //       this.registers.C = (this.registers.C - 1) & 0xFF; // Decrement C and mask to 8 bits
  //       this.registers.PC++; // Increment PC
  //       this.registers.flags.Z = (this.registers.C === 0) ? 1 : 0; // Zero flag
  //       this.registers.flags.S = (this.registers.C & 0x80) ? 1 : 0; // Sign flag
  //       this.registers.flags.AC = (this.registers.C & 0x0F) === 0x0F ? 1 : 0; // Auxiliary carry flag (must check if it goes from 0 to 0xFF)
  //       this.registers.flags.P = this.calculateParity(this.registers.C); // Parity flag
  //       break;

  //     // MVI C, D8
  //     // Load the 8-bit data into the C register
  //     case "0e":
  //       this.registers.C = this.instructions[this.registers.PC + 1]; // Load immediate value into C
  //       this.registers.PC += 2; // Increment PC by 2
  //       break;

  //     // RRC
  //     // Rotate the A register right
  //     // The carry flag is set to the most significant bit of the A register
  //     case "0f":
  //       this.registers.flags.CY = this.registers.A & 0x01; // Set carry flag to LSB of A
  //       this.registers.A = (this.registers.A >> 1) | ((this.registers.A & 0x01) << 7); // Rotate right
  //       this.registers.PC++; // Increment PC
  //       break;

  //     // NOP
  //     case "10":
  //       this.registers.PC++; // No operation, just increment PC
  //       break;

  //     // LXI D, D16
  //     // Load the 16-bit data into the D and E registers
  //     case "11":
  //       this.registers.E = this.instructions[this.registers.PC + 1]; // Load lower byte into E
  //       this.registers.D = this.instructions[this.registers.PC + 2]; // Load upper byte into D
  //       this.registers.PC += 3; // Increment PC by 3
  //       break;

  //     // STAX D
  //     // Store the A register at the DE address
  //     case "12":
  //       address = (this.registers.D << 8) | this.registers.E; // Combine D and E to form the address
  //       console.log("STA D address", address, "Hex", address.toString(16));
  //       this.memory[address] = this.registers.A; // Store A in memory
  //       this.registers.PC++; // Increment PC
  //       break;

  //     // INX D
  //     // Increment the DE register pair
  //     case "13":
  //       de = (this.registers.D << 8) | this.registers.E; // Combine D and E
  //       de++; // Increment DE
  //       this.registers.D = (de >> 8) & 0xFF; // Update upper byte
  //       this.registers.E = de & 0x00FF; // Update lower byte
  //       this.registers.PC++; // Increment PC
  //       break;

  //     // INR D
  //     // Increment the D register
  //     case "14":
  //       this.registers.D++; // Increment D register
  //       this.registers.PC++; // Increment PC
  //       // Set flags
  //       this.registers.flags.Z = this.registers.D === 0 ? 1 : 0; // Zero flag
  //       this.registers.flags.S = (this.registers.D & 0x80) ? 1 : 0; // Sign flag
  //       this.registers.flags.AC = ((this.registers.D & 0x0f) === 0x00) ? 1 : 0; // Auxiliary carry flag
  //       this.registers.flags.P = this.calculateParity(this.registers.D); // Parity flag
  //       break;

  //     // DCR D
  //     // Decrement the D register
  //     case "15":
  //       this.registers.D--; // Decrement D register
  //       this.registers.PC++; // Increment PC
  //       // Set flags
  //       this.registers.flags.Z = this.registers.D === 0 ? 1 : 0; // Zero flag
  //       this.registers.flags.S = (this.registers.D & 0x80) ? 1 : 0; // Sign flag
  //       this.registers.flags.AC = (this.registers.D & 0x0f) === 0x0f ? 1 : 0; // Auxiliary carry flag
  //       this.registers.flags.P = this.calculateParity(this.registers.D); // Parity flag
  //       break;

  //     // NOP
  //     case "18":
  //       this.registers.PC++; // No operation, just increment PC
  //       break;

  //     // DAD D
  //     // Add the D and E registers to the H and L registers
  //     case "19":
  //       de = (this.registers.D << 8) | this.registers.E; // Combine D and E to form DE
  //       hl = (this.registers.H << 8) | this.registers.L; // Combine H and L to form HL
  //       result = hl + de; // Add HL and DE
  //       this.registers.H = (result >> 8) & 0xFF; // Update H with the upper byte
  //       this.registers.L = result & 0x00FF; // Update L with the lower byte
  //       this.registers.flags.CY = (result > 0xFFFF) ? 1 : 0; // Set carry flag if overflow
  //       this.registers.flags.AC = ((hl & 0x0F) + (de & 0x0F)) > 0x0F ? 1 : 0;
  //       this.registers.PC++; // Increment PC
  //       break;

  //     // LDAX D
  //     // Load the A register with the value at the DE address
  //     case "1a":
  //       address = (this.registers.D << 8) | this.registers.E; // Calculate address from D and E
  //       this.registers.A = this.memory[address]; // Load value into A
  //       this.registers.PC++; // Increment PC
  //       break;

  //     // DCX D
  //     // Decrement the DE register pair
  //     case "1b":
  //       de = (this.registers.D << 8) | this.registers.E; // Combine D and E to form DE
  //       de--; // Decrement DE
  //       this.registers.D = (de >> 8) & 0xFF; // Update D with the upper byte
  //       this.registers.E = de & 0x00FF; // Update E with the lower byte
  //       this.registers.PC++; // Increment PC
  //       break;

  //     // INR E
  //     // Increment the E register
  //     case "1c":
  //       this.registers.E++; // Increment E register
  //       this.registers.PC++; // Increment PC
  //       // Set flags
  //       this.registers.flags.Z = (this.registers.E === 0) ? 1 : 0; // Zero flag
  //       this.registers.flags.S = (this.registers.E & 0x80) ? 1 : 0; // Sign flag
  //       this.registers.flags.AC = ((this.registers.E & 0x0F) === 0x00) ? 1 : 0; // Auxiliary carry flag
  //       this.registers.flags.P = this.calculateParity(this.registers.E); // Parity flag
  //       break;

  //     // MVI E, D8
  //     // Load the 8-bit data into the E register
  //     case "1e":
  //       this.registers.E = this.instructions[this.registers.PC + 1]; // Load immediate value into E
  //       this.registers.PC += 2; // Increment PC by 2
  //       break;

  //     // RAR
  //     // Rotate the A register right through the carry flag
  //     case "1f":
  //       let msb = this.registers.A & 0x01; // Store the least significant bit (LSB)
  //       this.registers.A = (this.registers.A >> 1) | (this.registers.flags.CY << 7); // Rotate right and set MSB from CY
  //       this.registers.flags.CY = msb; // Update carry flag with the old LSB
  //       this.registers.PC++; // Increment PC
  //       break;

  //     // NOP
  //     case "20":
  //       this.registers.PC++;
  //       break;

  //     // LXI H, D16
  //     // Load the 16-bit data into the H and L registers
  //     case "21":
  //       this.registers.L = this.instructions[this.registers.PC + 1];
  //       this.registers.H = this.instructions[this.registers.PC + 2];
  //       this.registers.PC += 3;
  //       break;

  //     // SHLD adr
  //     // Store the H and L registers at the address
  //     case "22":
  //       address = (this.instructions[this.registers.PC + 2] << 8) | this.instructions[this.registers.PC + 1];
  //       this.memory[address] = this.registers.L;
  //       this.memory[address + 1] = this.registers.H;
  //       this.registers.PC += 3;
  //       break;

  //     // INX H
  //     // Increment the HL register pair
  //     case "23":
  //       hl = (this.registers.H << 8) | this.registers.L;
  //       hl = (hl + 1) & 0xFFFF; // Ensure 16-bit wraparound
  //       this.registers.H = (hl >> 8) & 0xFF;
  //       this.registers.L = hl & 0xFF;
  //       this.registers.PC++;
  //       break;

  //     // INR H
  //     // Increment the H register
  //     case "24":
  //       this.registers.H = (this.registers.H + 1) & 0xFF; // Ensure 8-bit wraparound
  //       this.registers.PC++;
  //       // Set flags
  //       this.registers.flags.Z = this.registers.H === 0 ? 1 : 0;
  //       this.registers.flags.S = (this.registers.H & 0x80) ? 1 : 0;
  //       this.registers.flags.AC = ((this.registers.H & 0x0F) === 0x00) ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.H);
  //       break;

  //     // DCR H
  //     // Decrement the H register
  //     case "25":
  //       this.registers.H = (this.registers.H - 1) & 0xFF; // Ensure 8-bit wraparound
  //       this.registers.PC++;
  //       // Set flags
  //       this.registers.flags.Z = this.registers.H === 0 ? 1 : 0;
  //       this.registers.flags.S = (this.registers.H & 0x80) ? 1 : 0;
  //       this.registers.flags.AC = ((this.registers.H & 0x0F) === 0x0F) ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.H);
  //       break;

  //     // MVI H, D8
  //     // Load the 8-bit data into the H register
  //     case "26":
  //       this.registers.H = this.instructions[this.registers.PC + 1];
  //       this.registers.PC += 2;
  //       break;

  //     // NOP
  //     case "28":
  //       this.registers.PC++;
  //       break;

  //     // DAD H
  //     // Add the HL register pair to itself (HL = HL + HL)
  //     case "29":
  //       hl = (this.registers.H << 8) | this.registers.L;
  //       result = hl + hl;
  //       this.registers.flags.CY = result > 0xFFFF ? 1 : 0;
  //       this.registers.H = (result >> 8) & 0xFF;
  //       this.registers.L = result & 0xFF;
  //       this.registers.PC++;
  //       break;

  //     // LHLD adr
  //     // Load the H and L registers with the data at the address
  //     case "2a":
  //       address = (this.instructions[this.registers.PC + 2] << 8) | this.instructions[this.registers.PC + 1];
  //       this.registers.L = this.memory[address];
  //       this.registers.H = this.memory[address + 1];
  //       this.registers.PC += 3;
  //       break;

  //     // DCX H
  //     // Decrement the HL register pair
  //     case "2b":
  //       hl = (this.registers.H << 8) | this.registers.L;
  //       hl = (hl - 1) & 0xFFFF; // Ensure 16-bit wraparound
  //       this.registers.H = (hl >> 8) & 0xFF;
  //       this.registers.L = hl & 0xFF;
  //       this.registers.PC++;
  //       break;

  //     // INR L
  //     // Increment the L register
  //     case "2c":
  //       this.registers.L = (this.registers.L + 1) & 0xFF; // Ensure 8-bit wraparound
  //       this.registers.PC++;
  //       // Set flags
  //       this.registers.flags.Z = this.registers.L === 0 ? 1 : 0;
  //       this.registers.flags.S = (this.registers.L & 0x80) ? 1 : 0;
  //       this.registers.flags.AC = ((this.registers.L & 0x0F) === 0) ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.L);
  //       break;

  //     // MVI L, D8
  //     // Load the 8-bit data into the L register
  //     case "2e":
  //       this.registers.L = this.instructions[this.registers.PC + 1];
  //       this.registers.PC += 2;
  //       break;

  //     // CMA
  //     // Complement the A register (invert all bits)
  //     case "2f":
  //       this.registers.A = ~this.registers.A & 0xFF; // Ensure A remains 8 bits
  //       this.registers.PC++;
  //       break;

  //     // NOP
  //     case "30":
  //       this.registers.PC++;
  //       break;

  //     // LXI SP, D16
  //     // Load the 16-bit data into the SP register
  //     case "31":
  //       this.registers.SP = (this.instructions[this.registers.PC + 2] << 8) | this.instructions[this.registers.PC + 1];
  //       this.registers.PC += 3;
  //       break;

  //     // STA adr
  //     // Store the A register at the specified address
  //     case "32":
  //       address = (this.instructions[this.registers.PC + 2] << 8) | this.instructions[this.registers.PC + 1];
  //       console.log("STA ADR address", address, "Hex", address.toString(16));
  //       this.memory[address] = this.registers.A;
  //       this.registers.PC += 3;
  //       break;

  //     // DCR M
  //     // Decrement the memory at the HL address
  //     case "35":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       this.memory[address] = (this.memory[address] - 1) & 0xff; // Ensure 8-bit wraparound
  //       this.registers.PC++;
  //       // Set flags
  //       this.registers.flags.Z = this.memory[address] === 0 ? 1 : 0; // Zero flag
  //       this.registers.flags.S = (this.memory[address] & 0x80) ? 1 : 0; // Sign flag
  //       this.registers.flags.P = this.calculateParity(this.memory[address]); // Parity flag

  //       // Adjust Auxiliary Carry (AC) flag
  //       this.registers.flags.AC = (((this.memory[address] + 1) & 0x0f) === 0) ? 1 : 0;

  //       break;

  //     // MVI M, D8
  //     // Load the 8-bit data into the memory at the HL address
  //     case "36":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       this.memory[address] = this.instructions[this.registers.PC + 1];
  //       this.registers.PC += 2;
  //       break;

  //     // STC
  //     // Set the carry flag
  //     case "37":
  //       this.registers.flags.CY = 1;
  //       this.registers.PC++;
  //       break;

  //     // NOP
  //     case "38":
  //       this.registers.PC++;
  //       break;

  //     // DAD SP
  //     // Add the SP register to the HL register pair
  //     case "39":
  //       // Combine H and L to form HL register
  //       hl = (this.registers.H << 8) | this.registers.L;
  //       result = hl + this.registers.SP; // HL + SP
  //       // Set carry flag based on 16-bit overflow
  //       this.registers.flags.CY = result > 0xffff ? 1 : 0;
  //       // Store result back in HL (ensure 16-bit wraparound)
  //       this.registers.H = (result >> 8) & 0xff; // Upper 8 bits
  //       this.registers.L = result & 0xff; // Lower 8 bits
  //       this.registers.PC++;
  //       break;

  //     // LDA adr
  //     // Load the A register with the value at the specified address
  //     case "3a":
  //       address = (this.instructions[this.registers.PC + 2] << 8) | this.instructions[this.registers.PC + 1];
  //       this.registers.A = this.memory[address];
  //       this.registers.PC += 3;
  //       break;

  //     // INR A
  //     // Increment the A register
  //     case "3c":
  //       this.registers.A = (this.registers.A + 1) & 0xff; // Ensure 8-bit wraparound
  //       this.registers.PC++;
  //       // Set flags
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = (this.registers.A & 0x80) ? 1 : 0;
  //       this.registers.flags.AC = (this.registers.A & 0x0f) === 0x00 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       break;

  //     // DCR A
  //     // Decrement the A register
  //     case "3d":
  //       this.registers.A = (this.registers.A - 1) & 0xff; // Ensure 8-bit wraparound
  //       this.registers.PC++;
  //       // Set flags
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = (this.registers.A & 0x80) ? 1 : 0;
  //       this.registers.flags.AC = (this.registers.A & 0x0f) === 0x0f ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       break;

  //     // MVI A, D8
  //     // Load the immediate 8-bit data into the A register
  //     case "3e":
  //       this.registers.A = this.instructions[this.registers.PC + 1];
  //       this.registers.PC += 2;
  //       break;

  //     // CMC
  //     // Complement the carry flag
  //     case "3f":
  //       this.registers.flags.CY = this.registers.flags.CY === 0 ? 1 : 0;
  //       this.registers.PC++;
  //       break;

  //     // MOV B, B - NOP (No operation since B is assigned to itself)
  //     case "40":
  //       // No action required; just increment the Program Counter
  //       this.registers.PC++;
  //       break;

  //     // MOV B, C - Transfer the value of C to B
  //     case "41":
  //       this.registers.B = this.registers.C;
  //       this.registers.PC++;
  //       break;

  //     // MOV B, D - Transfer the value of D to B
  //     case "42":
  //       this.registers.B = this.registers.D;
  //       this.registers.PC++;
  //       break;

  //     // MOV B, M - Load the value from memory at the HL address into B
  //     case "46":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       this.registers.B = this.memory[address];
  //       this.registers.PC++;
  //       break;

  //     // MOV C, C - NOP (No operation since C is assigned to itself)
  //     case "49":
  //       // No action required; just increment the Program Counter
  //       this.registers.PC++;
  //       break;

  //     // MOV C, M - Load the value from memory at the HL address into C
  //     case "4e":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       this.registers.C = this.memory[address];
  //       this.registers.PC++;
  //       break;

  //     // MOV D, M - Load the value from memory at the HL address into D
  //     case "56":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       this.registers.D = this.memory[address];
  //       this.registers.PC++;
  //       break;

  //     // MOV D, A - Transfer the value of A to D
  //     case "57":
  //       this.registers.D = this.registers.A;
  //       this.registers.PC++;
  //       break;

  //     // MOV E, M - Load the value from memory at the HL address into E
  //     case "5e":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       this.registers.E = this.memory[address];
  //       this.registers.PC++;
  //       break;

  //     // MOV E, A - Transfer the value of A to E
  //     case "5f":
  //       this.registers.E = this.registers.A;
  //       this.registers.PC++;
  //       break;

  //     // MOV H, B - Transfer the value of B to H
  //     case "60":
  //       this.registers.H = this.registers.B;
  //       this.registers.PC++;
  //       break;

  //     // MOV H, C - Transfer the value of C to H
  //     case "61":
  //       this.registers.H = this.registers.C;
  //       this.registers.PC++;
  //       break;

  //     // MOV H, M - Load the value from memory at the HL address into H
  //     case "66":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       this.registers.H = this.memory[address];
  //       this.registers.PC++;
  //       break;

  //     // MOV H, A - Transfer the value of A to H
  //     case "67":
  //       this.registers.H = this.registers.A;
  //       this.registers.PC++;
  //       break;

  //     // MOV L, H - Transfer the value of H to L
  //     case "6c":
  //       this.registers.L = this.registers.H;
  //       this.registers.PC++;
  //       break;

  //     // MOV L, M - Load the value from memory at the HL address into L
  //     case "6e":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       this.registers.L = this.memory[address];
  //       this.registers.PC++;
  //       break;

  //     // MOV L, A - Transfer the value of A to L
  //     case "6f":
  //       this.registers.L = this.registers.A;
  //       this.registers.PC++;
  //       break;

  //     // MOV M, A - Store the value of A into memory at the HL address
  //     case "77":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       console.log("MOV M, A address", address, "Hex", address.toString(16));
  //       this.memory[address] = this.registers.A;
  //       this.registers.PC++;
  //       break;

  //     // MOV A, B - Transfer the value of B to A
  //     case "78":
  //       this.registers.A = this.registers.B;
  //       this.registers.PC++;
  //       break;

  //     // MOV A, D - Transfer the value of D to A
  //     case "7a":
  //       this.registers.A = this.registers.D;
  //       this.registers.PC++;
  //       break;

  //     // MOV A, E - Transfer the value of E to A
  //     case "7b":
  //       this.registers.A = this.registers.E;
  //       this.registers.PC++;
  //       break;

  //     // MOV A, H - Transfer the value of H to A
  //     case "7c":
  //       this.registers.A = this.registers.H;
  //       this.registers.PC++;
  //       break;

  //     // MOV A, L - Transfer the value of L to A
  //     case "7d":
  //       this.registers.A = this.registers.L;
  //       this.registers.PC++;
  //       break;

  //     // MOV A, M - Load the value from memory at the HL address into A
  //     case "7e":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       this.registers.A = this.memory[address];
  //       this.registers.PC++;
  //       break;

  //     // MOV A, A - Self-move, A to A (essentially a NOP on A)
  //     case "7f":
  //       this.registers.A = this.registers.A;
  //       this.registers.PC++;
  //       break;

  //     // ADD B - Add the B register to the A register
  //     case "80":
  //       addResult = this.registers.A + this.registers.B;
  //       this.registers.flags.CY = addResult > 0xff ? 1 : 0; // Set carry if result > 8 bits
  //       this.registers.flags.AC = ((this.registers.A & 0x0f) + (this.registers.B & 0x0f)) > 0x0f ? 1 : 0; // Auxiliary carry
  //       this.registers.A = addResult & 0xff; // Keep A within 8 bits
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0; // Zero flag
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0; // Sign flag
  //       this.registers.flags.P = this.calculateParity(this.registers.A); // Parity flag
  //       this.registers.PC++;
  //       break;

  //     // ADD D - Add the D register to the A register
  //     case "82":
  //       addResult = this.registers.A + this.registers.D;
  //       this.registers.flags.CY = addResult > 0xff ? 1 : 0;
  //       this.registers.flags.AC = ((this.registers.A & 0x0f) + (this.registers.D & 0x0f)) > 0x0f ? 1 : 0;
  //       this.registers.A = addResult & 0xff;
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       this.registers.PC++;
  //       break;

  //     // ADC H - Add the H register to the A register with carry
  //     case "8c":
  //       addResult = this.registers.A + this.registers.H + this.registers.flags.CY;
  //       this.registers.flags.CY = addResult > 0xff ? 1 : 0;
  //       this.registers.flags.AC = ((this.registers.A & 0x0f) + (this.registers.H & 0x0f) + this.registers.flags.CY) > 0x0f ? 1 : 0;
  //       this.registers.A = addResult & 0xff;
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       this.registers.PC++;
  //       break;

  //     // ADC M - Add the memory at the HL address to the A register with carry
  //     case "8e":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       addResult = this.registers.A + this.memory[address] + this.registers.flags.CY;
  //       this.registers.flags.CY = addResult > 0xff ? 1 : 0;
  //       this.registers.flags.AC = ((this.registers.A & 0x0f) + (this.memory[address] & 0x0f) + this.registers.flags.CY) > 0x0f ? 1 : 0;
  //       this.registers.A = addResult & 0xff;
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       this.registers.PC++;
  //       break;

  //     // SUB B - Subtract the B register from the A register
  //     case "90":
  //       subResult = (this.registers.A - this.registers.B) & 0xff;
  //       this.registers.flags.CY = this.registers.A < this.registers.B ? 1 : 0;
  //       this.registers.flags.AC = ((this.registers.A & 0x0f) < (this.registers.B & 0x0f)) ? 1 : 0;
  //       this.registers.A = subResult;
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       this.registers.PC++;
  //       break;

  //     // SBB M - Subtract the memory at the HL address from the A register with borrow
  //     case "9e":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       let borrowValue = this.memory[address] + this.registers.flags.CY;
  //       subResult = (this.registers.A - borrowValue) & 0xff;
  //       this.registers.flags.CY = this.registers.A < borrowValue ? 1 : 0;
  //       this.registers.flags.AC = ((this.registers.A & 0x0f) < (borrowValue & 0x0f)) ? 1 : 0;
  //       this.registers.A = subResult;
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       this.registers.PC++;
  //       break;

  //     // ANA B - Perform a bitwise AND on the A register and the B register
  //     case "a0":
  //       this.registers.A &= this.registers.B;
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       this.registers.flags.CY = 0;
  //       this.registers.flags.AC = 0;
  //       this.registers.PC++;
  //       break;

  //     // ANA M - Perform a bitwise AND on the A register and the memory at the HL address
  //     case "a6":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       this.registers.A &= this.memory[address];
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       this.registers.flags.CY = 0;
  //       this.registers.flags.AC = 0;
  //       this.registers.PC++;
  //       break;

  //     // ANA A - Perform a bitwise AND on the A register with itself
  //     case "a7":
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       this.registers.flags.CY = 0;
  //       this.registers.flags.AC = 0;
  //       this.registers.PC++;
  //       break;

  //     // XRA A - Perform a bitwise XOR on the A register with itself, resulting in 0
  //     case "af":
  //       this.registers.A ^= this.registers.A;
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       this.registers.flags.CY = 0;
  //       this.registers.flags.AC = 0;
  //       this.registers.PC++;
  //       break;

  //     // ORA H - Perform a bitwise OR on the A register and the H register
  //     case "b4":
  //       this.registers.A |= this.registers.H;
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       this.registers.flags.CY = 0; // OR operation does not affect CY
  //       this.registers.flags.AC = 0;  // OR operation does not affect AC
  //       this.registers.PC++;
  //       break;

  //     // ORA M - Perform a bitwise OR on the A register and the memory at the HL address
  //     case "b6":
  //       address = (this.registers.H << 8) | this.registers.L;
  //       this.registers.A |= this.memory[address];
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0;
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(this.registers.A);
  //       this.registers.flags.CY = 0; // OR operation does not affect CY
  //       this.registers.flags.AC = 0;  // OR operation does not affect AC
  //       this.registers.PC++;
  //       break;

  //     // CMP B - Compare the B register with the A register
  //     case "b8":
  //       result = (this.registers.A - this.registers.B) & 0xff; // Ensure result is 8-bit
  //       this.registers.flags.Z = result === 0 ? 1 : 0;
  //       this.registers.flags.S = result & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(result);
  //       this.registers.flags.CY = this.registers.A < this.registers.B ? 1 : 0;
  //       this.registers.flags.AC = (this.registers.A & 0x0f) < (this.registers.B & 0x0f) ? 1 : 0;
  //       this.registers.PC++;
  //       break;

  //     // CMP E - Compare the E register with the A register
  //     case "bb":
  //       result = (this.registers.A - this.registers.E) & 0xff; // Ensure result is 8-bit
  //       this.registers.flags.Z = result === 0 ? 1 : 0;
  //       this.registers.flags.S = result & 0x80 ? 1 : 0;
  //       this.registers.flags.P = this.calculateParity(result);
  //       this.registers.flags.CY = this.registers.A < this.registers.E ? 1 : 0;
  //       this.registers.flags.AC = (this.registers.A & 0x0f) < (this.registers.E & 0x0f) ? 1 : 0;
  //       this.registers.PC++;
  //       break;

  //     // RNZ - Return if the zero flag is not set
  //     case "c0":
  //       if (this.registers.flags.Z === 0) {
  //         // Pop the address from the stack and set it to PC
  //         this.registers.PC =
  //           (this.stack[this.registers.SP + 1] << 8) |
  //           this.stack[this.registers.SP];
  //         this.registers.SP += 2; // Move stack pointer up by 2 after popping
  //       } else {
  //         this.registers.PC++; // Increment program counter if Z flag is set
  //       }
  //       break;

  //     // POP B - Pop the top two bytes off the stack into the B and C registers
  //     case "c1":
  //       this.registers.C = this.stack[this.registers.SP]; // Pop C
  //       this.registers.B = this.stack[this.registers.SP + 1]; // Pop B
  //       this.registers.SP += 2; // Move stack pointer up by 2 after popping
  //       this.registers.PC++; // Increment program counter
  //       break;

  //     // JNZ adr - Jump if the zero flag is not set
  //     case "c2":
  //       address =
  //         (this.instructions[this.registers.PC + 2] << 8) |
  //         this.instructions[this.registers.PC + 1];
  //       if (this.registers.flags.Z === 0) {
  //         this.registers.PC = address; // Jump to address
  //       } else {
  //         this.registers.PC += 3; // Skip the address if Z flag is set
  //       }
  //       break;

  //     // JMP adr - Jump to address
  //     case "c3":
  //       const byte1 = this.instructions[this.registers.PC + 1];
  //       const byte2 = this.instructions[this.registers.PC + 2];
  //       address = (byte2 << 8) | byte1; // Combine bytes to form address
  //       this.registers.PC = address; // Set PC to the new address
  //       break;

  //     // PUSH B - Push the contents of the B and C registers onto the stack
  //     case "c5":
  //       this.registers.SP -= 1; // Decrement stack pointer for the first byte (C)
  //       this.stack[this.registers.SP] = this.registers.C; // Push C
  //       this.registers.SP -= 1; // Decrement stack pointer for the second byte (B)
  //       this.stack[this.registers.SP] = this.registers.B; // Push B
  //       this.registers.PC++; // Increment program counter
  //       break;

  //     // ADI D8 - Add immediate data to A
  //     case "c6":
  //       value = this.instructions[this.registers.PC + 1];
  //       result = this.registers.A + value; // Add the value to A
  //       this.registers.flags.Z = (result & 0xff) === 0 ? 1 : 0; // Zero flag
  //       this.registers.flags.S = (result & 0x80) ? 1 : 0; // Sign flag
  //       this.registers.flags.P = this.calculateParity(result & 0xff); // Parity flag
  //       this.registers.flags.CY = result > 0xff ? 1 : 0; // Carry flag
  //       this.registers.flags.AC = ((this.registers.A & 0x0f) + (value & 0x0f)) > 0x0f ? 1 : 0; // Auxiliary carry flag
  //       this.registers.A = result & 0xff; // Store result back in A
  //       this.registers.PC += 2; // Move PC to the next instruction
  //       break;

  //     // RZ - Return if the zero flag is set
  //     case "c8":
  //       if (this.registers.flags.Z === 1) {
  //         // Pop two bytes from the stack and set them as the new PC address
  //         this.registers.PC =
  //           (this.stack[this.registers.SP + 1] << 8) |
  //           this.stack[this.registers.SP];
  //         this.registers.SP += 2; // Move stack pointer up by 2 after popping
  //       } else {
  //         this.registers.PC++; // Move to the next instruction if Z flag is not set
  //       }
  //       break;

  //     // RET - Return from subroutine
  //     case "c9":
  //       this.registers.PC =
  //         (this.stack[this.registers.SP + 1] << 8) |
  //         this.stack[this.registers.SP];
  //       this.registers.SP += 2; // Move stack pointer up by 2 after popping
  //       break;

  //     // JZ - Jump if the zero flag is set
  //     case "ca":
  //       address =
  //         (this.instructions[this.registers.PC + 2] << 8) |
  //         this.instructions[this.registers.PC + 1];
  //       if (this.registers.flags.Z === 1) {
  //         this.registers.PC = address; // Jump to the specified address if Z flag is set
  //       } else {
  //         this.registers.PC += 3; // Skip the next two bytes if Z flag is not set
  //       }
  //       break;

  //     // NOP - No operation
  //     case "cb":
  //       this.registers.PC++; // Simply increment the program counter
  //       break;

  //     // CALL adr - Call a subroutine at the specified address
  //     case "cd":
  //       // Calculate the target address from the next two bytes in little-endian order
  //       address =
  //         this.instructions[this.registers.PC + 1] |
  //         (this.instructions[this.registers.PC + 2] << 8);

  //       // Push the return address (PC + 3) onto the stack, with high byte first
  //       this.registers.SP -= 1; // Decrement SP for the high byte
  //       this.stack[this.registers.SP] = (this.registers.PC + 3) >> 8; // High byte of return address
  //       this.registers.SP -= 1; // Decrement SP for the low byte
  //       this.stack[this.registers.SP] = (this.registers.PC + 3) & 0xff; // Low byte of return address

  //       // Set the PC to the target address for the subroutine
  //       this.registers.PC = address;
  //       break;

  //     // RST 1 - Call the interrupt vector at address 0x08
  //     case "cf":
  //       // Push the address of the next instruction (PC + 1) onto the stack
  //       this.registers.SP -= 1; // Decrement SP for the high byte
  //       this.stack[this.registers.SP] = (this.registers.PC + 1) >> 8; // High byte of return address
  //       this.registers.SP -= 1; // Decrement SP for the low byte
  //       this.stack[this.registers.SP] = (this.registers.PC + 1) & 0xff; // Low byte of return address

  //       // Set the PC to the predefined address for RST 1
  //       this.registers.PC = 8; //0x08; // Jump to interrupt vector for RST 1
  //       break;

  //     // RNC - Return if the carry flag is not set
  //     case "d0":
  //       if (this.registers.flags.CY === 0) {
  //         // Pop two bytes from the stack to set as the new PC address
  //         this.registers.PC =
  //           this.stack[this.registers.SP] | (this.stack[this.registers.SP + 1] << 8);
  //         this.registers.SP += 2; // Move stack pointer up by 2 after popping
  //       } else {
  //         this.registers.PC++; // Move to the next instruction if carry flag is set
  //       }
  //       break;

  //     // JNC adr - Jump to the address if the carry flag is not set
  //     case "d2":
  //       address =
  //         (this.instructions[this.registers.PC + 2] << 8) |
  //         this.instructions[this.registers.PC + 1];
  //       if (this.registers.flags.CY === 0) {
  //         this.registers.PC = address; // Jump to the specified address if CY is not set
  //       } else {
  //         this.registers.PC += 3; // Skip the next two bytes if CY is set
  //       }
  //       break;

  //     // CNC adr - Call the address if the carry flag is not set
  //     case "d4":
  //       // Calculate the target address from the next two bytes (little-endian)
  //       address =
  //         this.instructions[this.registers.PC + 1] |
  //         (this.instructions[this.registers.PC + 2] << 8);

  //       if (this.registers.flags.CY === 0) {
  //         // Push the address of the next instruction (PC + 3) onto the stack
  //         this.registers.SP -= 1; // Decrement SP for high byte
  //         this.stack[this.registers.SP] = (this.registers.PC + 3) >> 8; // High byte of return address
  //         this.registers.SP -= 1; // Decrement SP for low byte
  //         this.stack[this.registers.SP] = (this.registers.PC + 3) & 0xff; // Low byte of return address

  //         // Set PC to the target address
  //         this.registers.PC = address;
  //       } else {
  //         this.registers.PC += 3; // Skip the next two bytes if CY is set
  //       }
  //       break;

  //     // RST 2 - Push the return address onto the stack and jump to address 0x10
  //     case "d7":
  //       // Push the address of the next instruction (PC + 1) onto the stack
  //       this.registers.SP -= 1; // Decrement SP for high byte
  //       this.stack[this.registers.SP] = (this.registers.PC + 1) >> 8; // High byte of return address
  //       this.registers.SP -= 1; // Decrement SP for low byte
  //       this.stack[this.registers.SP] = (this.registers.PC + 1) & 0xff; // Low byte of return address

  //       // Set the PC to the predefined address for RST 2
  //       this.registers.PC = 16; //0x10; // Jump to the RST 2 interrupt vector
  //       break;

  //     // POP D - Pop the top two bytes off the stack into the D and E registers
  //     case "d1":
  //       this.registers.E = this.stack[this.registers.SP]; // Pop the lower byte into E
  //       this.registers.D = this.stack[this.registers.SP + 1]; // Pop the higher byte into D
  //       this.registers.SP += 2; // Move stack pointer up by 2 after popping
  //       this.registers.PC++; // Increment program counter
  //       break;

  //     // JC adr - Jump to the address if the carry flag is set
  //     case "da":
  //       address =
  //         (this.instructions[this.registers.PC + 2] << 8) |
  //         this.instructions[this.registers.PC + 1];
  //       if (this.registers.flags.CY === 1) {
  //         this.registers.PC = address; // Jump to address if carry flag is set
  //       } else {
  //         this.registers.PC += 3; // Skip the next two bytes if carry flag is not set
  //       }
  //       break;

  //     // IN D8 - Input from a specified port
  //     case "db":
  //       const portNumber = this.instructions[this.registers.PC + 1];
  //       // this.inputPort(portNumber);
  //       this.registers.PC += 2; // Move to the next instruction
  //       break;

  //     // CC adr - Call the address if the carry flag is set
  //     case "dc":
  //       address = (this.instructions[this.registers.PC + 2] << 8) | this.instructions[this.registers.PC + 1];
  //       if (this.registers.flags.CY === 1) {
  //         // Push the address of the next instruction (PC + 3) onto the stack
  //         this.registers.SP -= 1; // Decrement SP for high byte
  //         this.stack[this.registers.SP] = (this.registers.PC + 3) >> 8; // High byte of return address
  //         this.registers.SP -= 1; // Decrement SP for low byte
  //         this.stack[this.registers.SP] = (this.registers.PC + 3) & 0xff; // Low byte of return address

  //         // Set PC to the target address
  //         this.registers.PC = address;
  //       } else {
  //         // If the carry flag is not set, skip the next two bytes and proceed to the next instruction
  //         this.registers.PC += 3;
  //       }
  //       break;

  //     // OUT D8 - Output to a specified port
  //     case "d3":
  //       const port = this.instructions[this.registers.PC + 1];
  //       // this.outputPort(port, this.registers.A); // Uncomment to send the value in A to the specified port
  //       this.registers.PC += 2; // Move to the next instruction
  //       break;

  //     // PUSH D - Push the values of the D and E registers onto the stack
  //     case "d5":
  //       this.registers.SP -= 1; // Decrement SP for high byte (D register)
  //       this.stack[this.registers.SP] = this.registers.D; // Push D onto the stack
  //       this.registers.SP -= 1; // Decrement SP for low byte (E register)
  //       this.stack[this.registers.SP] = this.registers.E; // Push E onto the stack

  //       this.registers.PC++; // Move to the next instruction
  //       break;

  //     // POP H - Pop two bytes from the stack into the H and L registers
  //     case "e1":
  //       this.registers.L = this.stack[this.registers.SP]; // Low byte (L register)
  //       this.registers.H = this.stack[this.registers.SP + 1]; // High byte (H register)
  //       this.registers.SP += 2; // Move stack pointer up by 2 after popping
  //       this.registers.PC++; // Move to the next instruction
  //       break;

  //     // JPO adr - Jump to the address if the parity flag is odd
  //     case "e2":
  //       address = (this.instructions[this.registers.PC + 2] << 8) | this.instructions[this.registers.PC + 1];
  //       if (this.registers.flags.P === 0) {
  //         this.registers.PC = address; // Jump to the specified address if P flag is odd
  //       } else {
  //         this.registers.PC += 3; // Skip the next two bytes if P flag is even
  //       }
  //       break;

  //     // PUSH H - Push the values of the H and L registers onto the stack
  //     case "e5":
  //       this.registers.SP -= 1; // Decrement SP for high byte (H register)
  //       this.stack[this.registers.SP] = this.registers.H; // Push H onto the stack
  //       this.registers.SP -= 1; // Decrement SP for low byte (L register)
  //       this.stack[this.registers.SP] = this.registers.L; // Push L onto the stack
  //       this.registers.PC++; // Move to the next instruction
  //       break;

  //     // ANI D8 - Perform a bitwise AND on the accumulator with the immediate value
  //     case "e6":
  //       value = this.instructions[this.registers.PC + 1]; // Get the immediate value
  //       this.registers.A &= value; // AND the accumulator with the immediate value
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0; // Set zero flag
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0; // Set sign flag
  //       this.registers.flags.P = this.calculateParity(this.registers.A); // Set parity flag
  //       this.registers.flags.CY = 0; // Clear carry flag
  //       this.registers.flags.AC = 0; // Clear auxiliary carry flag
  //       this.registers.PC += 2; // Move to the next instruction
  //       break;

  //     // RPE - Return if the parity flag is even
  //     case "e8":
  //       if (this.registers.flags.P === 1) {
  //         // Pop the return address from the stack (low byte first)
  //         this.registers.PC =
  //           this.stack[this.registers.SP] | (this.stack[this.registers.SP + 1] << 8);
  //         this.registers.SP += 2; // Move stack pointer up by 2 after popping
  //       } else {
  //         this.registers.PC++; // Move to the next instruction if parity flag is odd
  //       }
  //       break;

  //     // XCHG - Exchange the contents of D, E with H, L registers
  //     case "eb":
  //       const tempD = this.registers.D; // Temporarily hold D
  //       const tempE = this.registers.E; // Temporarily hold E
  //       this.registers.D = this.registers.H; // Move H to D
  //       this.registers.E = this.registers.L; // Move L to E
  //       this.registers.H = tempD; // Move D to H
  //       this.registers.L = tempE; // Move E to L
  //       this.registers.PC++; // Move to the next instruction
  //       break;

  //     // XRI D8 - Perform a bitwise XOR on the accumulator with the immediate value
  //     case "ee":
  //       value = this.instructions[this.registers.PC + 1]; // Get the immediate value
  //       this.registers.A ^= value; // XOR the accumulator with the immediate value
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0; // Set zero flag
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0; // Set sign flag
  //       this.registers.flags.P = this.calculateParity(this.registers.A); // Set parity flag
  //       this.registers.flags.CY = 0; // Clear carry flag
  //       this.registers.flags.AC = 0; // Clear auxiliary carry flag
  //       this.registers.PC += 2; // Move to the next instruction
  //       break;

  //     // POP PSW - Pop the top two bytes off the stack into the A register and flags
  //     case "f1":
  //       // Load A register from the stack
  //       this.registers.A = this.stack[this.registers.SP];

  //       // Load processor status word (PSW) from the stack
  //       psw = this.stack[this.registers.SP + 1];
  //       this.registers.flags.Z = (psw & 0x40) >> 6;  // Zero flag
  //       this.registers.flags.S = (psw & 0x80) >> 7;  // Sign flag
  //       this.registers.flags.P = (psw & 0x04) >> 2;  // Parity flag
  //       this.registers.flags.CY = psw & 0x01;        // Carry flag
  //       this.registers.flags.AC = (psw & 0x10) >> 4; // Auxiliary Carry flag

  //       // Move the stack pointer up by 2 to reflect the pop operation
  //       this.registers.SP += 2;

  //       // Move to the next instruction
  //       this.registers.PC++;
  //       break;

  //     // DI - Disable interrupts
  //     case "f3":
  //       this.interruptsEnabled = false; // Disable interrupts
  //       this.registers.PC++; // Move to the next instruction
  //       break;

  //     // PUSH PSW - Push the A register and the processor status word (PSW) onto the stack
  //     case "f5":
  //       // Construct the PSW byte from the flag registers
  //       psw =
  //         (this.registers.flags.S << 7) | // Set sign flag
  //         (this.registers.flags.Z << 6) | // Set zero flag
  //         (this.registers.flags.AC << 4) | // Set auxiliary carry flag
  //         (this.registers.flags.P << 2) | // Set parity flag
  //         this.registers.flags.CY; // Set carry flag

  //       // Push the A register (accumulator) and PSW onto the stack
  //       this.registers.SP -= 1; // Decrement stack pointer for PSW
  //       this.stack[this.registers.SP] = psw; // Push PSW onto the stack
  //       this.registers.SP -= 1; // Decrement stack pointer for A
  //       this.stack[this.registers.SP] = this.registers.A; // Push A onto the stack

  //       // Move to the next instruction
  //       this.registers.PC++;
  //       break;

  //     // ORI D8 - Logical OR immediate with A register
  //     case "f6":
  //       value = this.instructions[this.registers.PC + 1];
  //       this.registers.A |= value; // Perform OR operation
  //       this.registers.flags.Z = this.registers.A === 0 ? 1 : 0; // Set Zero flag
  //       this.registers.flags.S = this.registers.A & 0x80 ? 1 : 0; // Set Sign flag
  //       this.registers.flags.P = this.calculateParity(this.registers.A); // Calculate Parity flag
  //       this.registers.flags.CY = 0; // Clear Carry flag
  //       this.registers.flags.AC = 0; // Clear Auxiliary Carry flag
  //       this.registers.PC += 2; // Move to the next instruction
  //       break;

  //     // RM - Return if the sign flag (S) is set
  //     case "f8":
  //       if (this.registers.flags.S === 1) {
  //         // Pop the return address from the stack (low byte first)
  //         this.registers.PC =
  //           this.stack[this.registers.SP] | (this.stack[this.registers.SP + 1] << 8);
  //         this.registers.SP += 2; // Move stack pointer up by 2 after popping
  //       } else {
  //         this.registers.PC++; // Move to the next instruction if sign flag is not set
  //       }
  //       break;

  //     // JM adr - Jump to the address if the sign flag (S) is set
  //     case "fa":
  //       address = (this.instructions[this.registers.PC + 2] << 8) | this.instructions[this.registers.PC + 1];
  //       if (this.registers.flags.S === 1) {
  //         // If the sign flag is set, update the program counter to the target address
  //         this.registers.PC = address;
  //       } else {
  //         // If the sign flag is not set, move to the next instruction
  //         this.registers.PC += 3; // Move to the next instruction (skipping the address bytes)
  //       }
  //       break;

  //     // EI - Enable interrupts
  //     case "fb":
  //       this.interruptsEnabled = true; // Set interrupts enabled
  //       this.registers.PC++; // Move to the next instruction
  //       break;

  //     // CPI D8 - Compare immediate with A register
  //     case "fe":
  //       value = this.instructions[this.registers.PC + 1];
  //       result = this.registers.A - value; // Perform subtraction
  //       this.registers.flags.Z = result === 0 ? 1 : 0; // Set Zero flag
  //       this.registers.flags.S = result & 0x80 ? 1 : 0; // Set Sign flag
  //       this.registers.flags.P = this.calculateParity(result); // Calculate Parity flag
  //       this.registers.flags.CY = this.registers.A < value ? 1 : 0; // Set Carry flag
  //       this.registers.flags.AC =
  //         (this.registers.A & 0x0f) - (value & 0x0f) < 0 ? 1 : 0; // Set Auxiliary Carry flag
  //       this.registers.PC += 2; // Move to the next instruction
  //       break;

  //     // RST 7 - Restart the program at address 0x38
  //     case "ff":
  //       // Check for stack overflow before pushing return address
  //       if (this.registers.SP < 2) {
  //         throw new Error("Stack overflow: not enough space to store the return address.");
  //       }

  //       // Push the address of the next instruction (PC + 1) onto the stack
  //       this.registers.SP -= 1; // Decrement SP for the high byte
  //       this.stack[this.registers.SP] = (this.registers.PC + 1) >> 8; // Push High byte
  //       this.registers.SP -= 1; // Decrement SP for the low byte
  //       this.stack[this.registers.SP] = (this.registers.PC + 1) & 0xff; // Push Low byte

  //       // Set the PC to the predefined restart address 0x38
  //       this.registers.PC = 0x38;
  //       break;

  //     default:
  //       console.log("Unimplemented instruction:", instruction);
  //       this.missing = true;
  //       break;
  //   }
  // }