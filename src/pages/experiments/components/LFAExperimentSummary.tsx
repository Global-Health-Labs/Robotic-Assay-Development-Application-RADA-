import { LFAExperimentWithDeckLayout } from '@/api/lfa-experiments.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from 'dayjs';
import { ExperimentFiles } from './ExperimentFiles';
import { useLFALiquidTypes } from '@/hooks/useLFALiquidTypes';

const LFAExperimentSummary: React.FC<{ experiment: LFAExperimentWithDeckLayout }> = ({
  experiment,
}) => {
  const hasSteps = experiment.steps && experiment.steps.length > 0;
  const { data: liquidTypes } = useLFALiquidTypes();

  const getLiquidTypeName = (liquidType: string) => {
    if (!liquidTypes) {
      return liquidType;
    }
    return liquidTypes.find((lt) => lt.value === liquidType)?.displayName || 'N/A';
  };

  const getLocation = (dx: number, dz: number) => {
    const location = experiment.assayPlateConfig?.locations.find(
      (loc) => loc.dx === dx && loc.dz === dz
    );
    return location || { name: 'Unknown', dx: dx, dz: dz };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Experiment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p>{experiment.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Owner</h3>
              <p>{experiment.ownerFullName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Deck Layout</h3>
              <p>{experiment.deckLayout?.name || ''}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Assay Plate Config</h3>
              <p>{experiment.assayPlateConfig?.name || ''}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Technical Replicates</h3>
              <p>{experiment.numReplicates}</p>
            </div>
            <div />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
              <p>{dayjs(experiment.createdAt).format('MMM DD, YYYY HH:mm')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p>{dayjs(experiment.updatedAt).format('MMM DD, YYYY HH:mm')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {hasSteps && (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                        Volume
                      </th>
                      <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                        Liquid Type
                      </th>
                      <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                        Time
                      </th>
                      <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                        Location
                      </th>
                      <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {experiment.steps?.map((step) => (
                      <tr key={step.step} className="border-b last:border-0">
                        <td className="p-2">{step.step}</td>
                        <td className="p-2">{step.volume}</td>
                        <td className="p-2">{getLiquidTypeName(step.liquidClass)}</td>
                        <td className="p-2">{step.time}</td>
                        <td className="p-2">{getLocation(step.dx, step.dz).name}</td>
                        <td className="p-2">{step.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!hasSteps && (
              <p className="text-sm text-muted-foreground">No steps defined for this experiment.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experiment Files</CardTitle>
        </CardHeader>
        <CardContent>
          <ExperimentFiles experimentId={experiment.id} experimentType="LFA" />
        </CardContent>
      </Card>
    </div>
  );
};

export default LFAExperimentSummary;
