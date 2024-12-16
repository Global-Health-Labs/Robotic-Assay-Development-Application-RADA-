interface ExperimentStep {
  step: string;
  dx: number;
  dz: number;
  volume: number;
  liquid_class: string;
  time: number;
  source: string;
}

interface PlateConfig {
  prefix: string;
  numPlates: number;
  numStripsPerPlate: number;
  numColumns: number;
  sourcePlates: {
    [key: string]: {
      name: string;
      wellCount: number;
      holdoverVolume: number;
      wellVolume: number;
    };
  };
}

interface WorklistOptions {
  numReplicates: number;
  stripsPerGroup: number;
  reverseVariableOrder: boolean;
  dispenseType: string;
  aspirationMixing: boolean;
  zeroFill: number;
  sortByColumn: boolean;
}

interface WorklistStep {
  step: string;
  dx: number;
  dz: number;
  volume_ul: number;
  liquid_class: string;
  timer_delta: number;
  source: string;
  step_index: number;
  destination: string;
  group_number: number;
  timer_group_check: number;
  guid: string;
  from_path: string;
  asp_mixing: number;
  dispense_type: string;
  tip_type: number;
  touchoff_dis: number;
  to_plate: string;
  to_well: string;
  from_plate: string;
  from_well: string;
  liquid_type_x: string;
  liquid_type_y: string;
  liquid_type: string;
}

interface UserSolution {
  solution: string;
  plate_well: string;
  user_input: number;
}

interface PlateWellAssignment {
  plateType: string;
  plateIndex: number;
  wellNumber: number;
  volume: number;
}

interface SourcePlateAssignment {
  source: string;
  step: string;
  stepIndex: number;
  volume: number;
  plateAssignments: PlateWellAssignment[];
}

function generateLiquidClass(liquidClass: string, tipType: number, dispenseType: string): string {
  return `ivl_tip${tipType}_${liquidClass}_${dispenseType}`;
}

function getTipType(volume: number): number {
  const types = [0, 50, 300, 1000];
  for (let i = 1; i < types.length; i++) {
    if (volume <= types[i]) return types[i];
  }
  return types[types.length - 1];
}

function getSource(worklist: WorklistStep[], plateDf: PlateConfig['sourcePlates']): SourcePlateAssignment[] {
  const groupByPlateWell = worklist.reduce((acc, step) => {
    const key = `${step.from_plate}|${step.from_well}`;
    if (!acc[key]) {
      acc[key] = { volume_ul: 0, sources: new Set<string>() };
    }
    acc[key].volume_ul += step.volume_ul;
    acc[key].sources.add(step.source);
    return acc;
  }, {} as Record<string, { volume_ul: number; sources: Set<string> }>);

  return Object.entries(groupByPlateWell).map(([key, { volume_ul, sources }]) => {
    const [from_plate, from_well] = key.split('|');
    const plateType = from_plate.split('_').slice(0, -1).join('_');
    const plate = plateDf[plateType];
    return {
      source: Array.from(sources)[0],
      step: '', // Step is not aggregated here
      stepIndex: 0, // StepIndex is not aggregated here
      volume: volume_ul + plate.holdoverVolume,
      plateAssignments: [{
        plateType,
        plateIndex: 1, // Assuming single plate index for simplicity
        wellNumber: parseInt(from_well, 10),
        volume: volume_ul + plate.holdoverVolume
      }]
    };
  });
}

function assignPlateWell(worklist: WorklistStep[], plateDf: PlateConfig['sourcePlates'], colname: string, useHoldover: boolean = true): void {
  worklist.forEach(step => {
    const plateType = step.from_plate.split('_').slice(0, -1).join('_');
    const plate = plateDf[plateType];
    const volumeUsable = plate.wellVolume - (useHoldover ? plate.holdoverVolume : 0);
    if (step.volume_ul > volumeUsable) {
      // Logic to handle volume exceeding usable volume
      // This might involve splitting the step into multiple transfers
    }
    // Assign plate and well here
  });
}

function updateLiquidClass(worklist: WorklistStep[], liquidTypeDf: Record<string, string>): void {
  worklist.forEach(step => {
    step.liquid_class = liquidTypeDf[step.liquid_class] || step.liquid_class;
  });
}

function assignSourcePlates(
  steps: { source: string; step: string; stepIndex: number; volume: number; totalVolume: number }[],
  plateConfig: PlateConfig
): SourcePlateAssignment[] {
  const assignments: SourcePlateAssignment[] = [];
  const usedWellsByPlateType = new Map<string, Set<number>>();

  // Group steps by source and step
  const stepsBySourceAndStep = new Map<string, typeof steps>();
  steps.forEach((step) => {
    if (step.source === 'camera') return; // Skip imaging steps
    const key = `${step.source}|${step.step}`;
    if (!stepsBySourceAndStep.has(key)) {
      stepsBySourceAndStep.set(key, []);
    }
    stepsBySourceAndStep.get(key)?.push(step);
  });

  // For each source and step combination
  stepsBySourceAndStep.forEach((sourceSteps, key) => {
    const [source, step] = key.split('|');
    const sources = source.split(',').map(s => s.trim());

    sources.forEach(singleSource => {
      // Calculate total volume needed
      const totalVolume = sourceSteps.reduce((sum, step) => sum + step.totalVolume, 0);
      
      // Select plate type based on volume
      const plateType = totalVolume > 100 ? 'ivl_96_dw_v1' : 'ivl_384_flat_v1';
      const plate = plateConfig.sourcePlates[plateType];
      
      // Initialize used wells set if not exists
      if (!usedWellsByPlateType.has(plateType)) {
        usedWellsByPlateType.set(plateType, new Set<number>());
      }
      const usedWells = usedWellsByPlateType.get(plateType)!;

      // Calculate plate dimensions
      const nrow = plateType === 'ivl_384_flat_v1' ? 16 : 8;
      const ncol = plateType === 'ivl_384_flat_v1' ? 24 : 12;

      // Find next available well
      let wellNumber = 1;
      const maxWells = nrow * ncol;
      while (wellNumber <= maxWells && usedWells.has(wellNumber)) {
        wellNumber++;
      }

      // For 384-well plates, adjust well number for column-wise distribution
      if (plateType === 'ivl_384_flat_v1') {
        const currentCol = Math.floor((wellNumber - 1) / nrow);
        const rowInCol = (wellNumber - 1) % nrow;
        wellNumber = currentCol * nrow * 2 + rowInCol * 2 + 1;
      }

      // Mark well as used
      usedWells.add(wellNumber);

      // Create plate assignment
      sourceSteps.forEach(step => {
        assignments.push({
          source: singleSource,
          step: step.step,
          stepIndex: step.stepIndex,
          volume: step.volume,
          plateAssignments: [{
            plateType: plateType,
            plateIndex: 1,
            wellNumber: wellNumber,
            volume: step.totalVolume + plate.holdoverVolume
          }]
        });
      });
    });
  });

  return assignments;
}

export function generateWorklistFiles(
  experimentSteps: ExperimentStep[],
  plateConfig: PlateConfig,
  options: WorklistOptions
): { worklistCsv: string; userSolutionCsv: string } {
  // Generate worklist steps
  const worklistSteps: WorklistStep[] = [];
  const userSolutions: UserSolution[] = [];
  let guid = 1;

  // Calculate total volumes needed for each source/step combination
  const volumeMultiplier = plateConfig.numStripsPerPlate * options.numReplicates;
  const stepsWithVolumes = experimentSteps.map((step, index) => ({
    source: step.source,
    step: step.step,
    stepIndex: index,
    volume: step.volume,
    totalVolume: step.volume * volumeMultiplier
  }));

  // Get source plate assignments
  const sourcePlateAssignments = assignSourcePlates(stepsWithVolumes, plateConfig);

  // Create map for quick lookup of assignments
  const assignmentMap = new Map<string, SourcePlateAssignment>();
  sourcePlateAssignments.forEach((assignment) => {
    const key = `${assignment.source}|${assignment.step}|${assignment.stepIndex}`;
    assignmentMap.set(key, assignment);
  });

  // Calculate destination groups
  const destinationsPerGroup = options.stripsPerGroup;
  const totalDestinations = plateConfig.numPlates * plateConfig.numStripsPerPlate;
  const destinationGroups = new Array(totalDestinations).fill(0).map((_, i) => 
    Math.floor(i / destinationsPerGroup) + 1
  );

  // Generate worklist steps
  experimentSteps.forEach((step, stepIndex) => {
    for (let plateNum = 1; plateNum <= plateConfig.numPlates; plateNum++) {
      const plateId = plateNum.toString().padStart(options.zeroFill, '0');
      const destPlate = `${plateConfig.prefix}_${plateId}`;

      for (let well = 1; well <= plateConfig.numStripsPerPlate; well++) {
        const destinationGroup = destinationGroups[well - 1];
        const groupNumber = Math.ceil(well / options.stripsPerGroup);

        if (step.step === 'imaging') {
          // Handle imaging steps
          worklistSteps.push({
            step: step.step,
            dx: step.dx,
            dz: step.dz,
            volume_ul: step.volume,
            liquid_class: generateLiquidClass(step.liquid_class, getTipType(step.volume), options.dispenseType),
            timer_delta: step.time,
            source: step.source,
            step_index: stepIndex + 1,
            destination: well.toString(),
            group_number: groupNumber,
            timer_group_check: step.time > 0 ? stepIndex + 1 : 0,
            guid: guid++,
            from_path: 'some path',
            asp_mixing: options.aspirationMixing ? 1 : 0,
            dispense_type: options.dispenseType,
            tip_type: getTipType(step.volume),
            touchoff_dis: -1,
            to_plate: destPlate,
            to_well: well.toString(),
            from_plate: destPlate,
            from_well: well.toString(),
            liquid_type_x: step.liquid_class,
            liquid_type_y: '',
            liquid_type: step.liquid_class
          });
          continue;
        }

        // Handle non-imaging steps
        const sources = step.source.split(',').map(s => s.trim());
        sources.forEach(source => {
          const assignment = assignmentMap.get(`${source}|${step.step}|${stepIndex}`);
          if (!assignment) return;

          assignment.plateAssignments.forEach(plateAssignment => {
            // Add to user solutions if not already present
            const solutionKey = `${source}|${plateAssignment.plateType}_${plateAssignment.plateIndex}|${plateAssignment.wellNumber}`;
            if (!userSolutions.some(sol => 
              sol.solution === source && 
              sol.plate_well === `${plateAssignment.plateType}_${plateAssignment.plateIndex}|${plateAssignment.wellNumber}`
            )) {
              userSolutions.push({
                solution: source,
                plate_well: `${plateAssignment.plateType}_${plateAssignment.plateIndex}|${plateAssignment.wellNumber}`,
                user_input: plateAssignment.volume
              });
            }

            worklistSteps.push({
              step: step.step,
              dx: step.dx,
              dz: step.dz,
              volume_ul: step.volume,
              liquid_class: generateLiquidClass(step.liquid_class, getTipType(step.volume), options.dispenseType),
              timer_delta: step.time,
              source: source,
              step_index: stepIndex + 1,
              destination: well.toString(),
              group_number: groupNumber,
              timer_group_check: step.time > 0 ? stepIndex + 1 : 0,
              guid: guid++,
              from_path: 'some path',
              asp_mixing: options.aspirationMixing ? 1 : 0,
              dispense_type: options.dispenseType,
              tip_type: getTipType(step.volume),
              touchoff_dis: -1,
              to_plate: destPlate,
              to_well: well.toString(),
              from_plate: `${plateAssignment.plateType}_${plateAssignment.plateIndex}`,
              from_well: plateAssignment.wellNumber.toString(),
              liquid_type_x: step.liquid_class,
              liquid_type_y: '',
              liquid_type: step.liquid_class
            });
          });
        });
      }
    }
  });

  // Sort worklist steps
  worklistSteps.sort((a, b) => {
    // Sort by step_index first
    if (a.step_index !== b.step_index) return a.step_index - b.step_index;
    // Then by group_number
    if (a.group_number !== b.group_number) return a.group_number - b.group_number;
    // Finally by destination
    return parseInt(a.destination) - parseInt(b.destination);
  });

  // Generate CSV content
  const worklistCsv = generateCsv(worklistSteps);
  const userSolutionCsv = generateCsv(userSolutions);

  return {
    worklistCsv,
    userSolutionCsv
  };
}

function generateCsv(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        })
        .join(',')
    ),
  ];

  return csvRows.join('\n');
}
