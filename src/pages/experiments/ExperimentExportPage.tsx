import { getExperiment } from '@/api/experiments.api';
import { GenerateWorklistFiles } from '@/components/experiments/generate-worklist-files';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

// interface Experiment {
//   id: string;
//   name: string;
//   mastermixVolumePerReaction: number;
//   sampleVolumePerReaction: number;
//   pcrPlateSize: number;
//   numOfSampleConcentrations: number;
//   numOfTechnicalReplicates: number;
//   masterMixes: {
//     id: string;
//     nameOfMasterMix: string;
//     recipes: {
//       id: string;
//       name: string;
//       volume: number;
//       liquidType?: string;
//       dispenseType?: string;
//       tipWashing?: string;
//     }[];
//   }[];
// }

interface FormattedExperiment {
  nameOfExperimentalPlan: string;
  masterMixVolumnPerReaction: number;
  sampleVolumnPerReaction: number;
  pcrPlateSize: number;
  numOfSampleConcentrations: number;
  numOfTechnicalReplicates: number;
  experimentalPlanID: string;
}

interface FormattedMastermix {
  id: string;
  nameOfMasterMix: string;
  recipeForEachMasterMix: {
    id: string;
    name: string;
    volume: number;
    finalSource: string;
    finalConcentration: number;
    stockConcentration: number;
    liquidType: string;
    dispenseType: string;
    tipWashing: string;
  }[];
}

export default function ExperimentExportPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: experiment,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => getExperiment(id!),
    enabled: !!id,
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
        <div className="flex flex-col space-y-6">
          <div>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="mt-2 h-4 w-[300px]" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
        <div className="text-red-500">
          Error loading experiment: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  // Handle case where experiment is undefined
  if (!experiment) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
        <div className="text-muted-foreground">No experiment data found</div>
      </div>
    );
  }

  // Format experiment data
  const formattedExperiment: FormattedExperiment[] = [
    {
      nameOfExperimentalPlan: experiment.nameOfExperimentalPlan,
      masterMixVolumnPerReaction: experiment.mastermixVolumePerReaction,
      sampleVolumnPerReaction: experiment.sampleVolumePerReaction,
      pcrPlateSize: Number(experiment.pcrPlateSize),
      numOfSampleConcentrations: experiment.numOfSampleConcentrations,
      numOfTechnicalReplicates: experiment.numOfTechnicalReplicates,
      experimentalPlanID: experiment.id,
    },
  ];

  // Format mastermixes data
  // const formattedMastermixes: FormattedMastermix[] = experiment.masterMixes.map((mastermix) => ({
  //   id: mastermix.id,
  //   nameOfMasterMix: mastermix.nameOfMasterMix,
  //   recipeForEachMasterMix: mastermix.recipes.map((recipe) => ({
  //     id: recipe.id,
  //     name: recipe.name,
  //     volume: recipe.volume,
  //     // Add required fields for mastermix generation
  //     finalSource: recipe.name,
  //     finalConcentration: recipe.volume,
  //     stockConcentration: recipe.volume,
  //     liquidType: recipe.liquidType || 'water',
  //     dispenseType: recipe.dispenseType || 'Surface_Empty',
  //     tipWashing: recipe.tipWashing || 'Yes',
  //   })),
  // }));

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Export Experiment</h2>
          <p className="text-muted-foreground">
            Generate worklist files for {experiment.nameOfExperimentalPlan}
          </p>
        </div>
      </div>
      <GenerateWorklistFiles
        experiment={formattedExperiment}
        mastermixes={experiment.masterMixes}
      />
    </div>
  );
}
