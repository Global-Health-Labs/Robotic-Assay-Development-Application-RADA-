import { NAATExperiment } from '@/api/naat-experiments.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from 'dayjs';
import { ExperimentFiles } from './ExperimentFiles';

const NAATExperimentSummary: React.FC<{ experiment: NAATExperiment }> = ({ experiment }) => {
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
              <h3 className="text-sm font-medium text-muted-foreground">Number of Samples</h3>
              <p>{experiment.numOfSampleConcentrations}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Technical Replicates</h3>
              <p>{experiment.numOfTechnicalReplicates}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">PCR Plate Size</h3>
              <p>{experiment.pcrPlateSize}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Mastermix Volume per Reaction
              </h3>
              <p>{experiment.mastermixVolumePerReaction} µL</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Sample Volume per Reaction
              </h3>
              <p>{experiment.sampleVolumePerReaction} µL</p>
            </div>
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

      {/* Mastermix details here */}
      <Card>
        <CardHeader>
          <CardTitle>Mastermix Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {experiment.mastermixes?.map((mastermix) => (
              <div key={mastermix.id} className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Mastermix Name</h3>
                  <p className="mt-1 font-medium">{mastermix.name}</p>
                </div>

                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                          Source
                        </th>
                        <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                          Concentration Unit
                        </th>
                        <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                          Final Concentration
                        </th>
                        <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                          Stock Concentration
                        </th>
                        <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                          Liquid Type
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mastermix.reagents?.map((reagent) => (
                        <tr key={reagent.id} className="border-b last:border-0">
                          <td className="p-2">{reagent.source}</td>
                          <td className="p-2">{reagent.unit}</td>
                          <td className="p-2">{reagent.finalConcentration}</td>
                          <td className="p-2">{reagent.stockConcentration}</td>
                          <td className="p-2">{reagent.liquidType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {(!experiment.mastermixes || experiment.mastermixes.length === 0) && (
              <p className="text-sm text-muted-foreground">
                No mastermixes defined for this experiment.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experiment Files</CardTitle>
        </CardHeader>
        <CardContent>
          <ExperimentFiles experimentId={experiment.id} experimentType="NAAT" />
        </CardContent>
      </Card>
    </div>
  );
};

export default NAATExperimentSummary;
