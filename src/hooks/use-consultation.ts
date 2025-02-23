
import { useVetStatus } from "./use-vet-status";
import { useConsultationActions } from "./use-consultation-actions";
import { useStartConsultation } from "./use-start-consultation";

export function useConsultation() {
  const { isOnline, toggleAvailability } = useVetStatus();
  const { handleConsultation, endConsultation } = useConsultationActions();
  const { startingConsultation, startConsultation } = useStartConsultation();

  return {
    startingConsultation,
    startConsultation,
    isOnline,
    toggleAvailability,
    handleConsultation,
    endConsultation,
  };
}
