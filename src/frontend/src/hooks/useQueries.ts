import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Document, ConfusionMatrixResult, GenderDistribution, GeoLocationDistribution, IntentionResult, CleaningLog } from '../backend';

export function useGetAllDocuments() {
  const { actor, isFetching } = useActor();

  return useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDocuments();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0, // Always consider stale to ensure fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useGetDocument(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Document | null>({
    queryKey: ['document', id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDocument(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Generate cleaning logs before uploading
      const cleaningLogs: CleaningLog[] = [
        { step: 'Menghapus duplikat', status: 'selesai', timestamp: BigInt(Date.now()) },
        { step: 'Menormalkan teks', status: 'selesai', timestamp: BigInt(Date.now()) },
        { step: 'Pembersihan karakter khusus', status: 'selesai', timestamp: BigInt(Date.now()) },
        { step: 'Validasi kolom penting', status: 'valid', timestamp: BigInt(Date.now()) },
        { step: 'Pemeriksaan nilai numerik', status: 'aman', timestamp: BigInt(Date.now()) },
      ];
      
      // Add cleaning logs to backend
      await actor.addCleaningLog(cleaningLogs);
      
      const docId = await actor.uploadDocument(content);
      
      // Trigger confusion matrix generation for all models after upload
      try {
        await actor.processIncorrect(content, 'BERT', 'interest', 'trust');
        await actor.processIncorrect(content, 'RoBERTa', 'interest', 'trust');
        await actor.processIncorrect(content, 'DistilBERT', 'interest', 'trust');
        await actor.processIncorrect(content, 'JC', 'interest', 'trust');
        await actor.processIncorrect(content, 'JA', 'interest', 'trust');
        await actor.processIncorrect(content, 'JD', 'interest', 'trust');
      } catch (error) {
        console.warn('Failed to generate confusion matrix:', error);
      }
      
      return docId;
    },
    onSuccess: () => {
      // Invalidate all queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['cleaningLogs'] });
      queryClient.invalidateQueries({ queryKey: ['confusionMatrix'] });
      queryClient.invalidateQueries({ queryKey: ['genderDistribution'] });
      queryClient.invalidateQueries({ queryKey: ['geoDistribution'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseIntention'] });
    },
  });
}

export function useDeleteDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteDocument(id);
    },
    onSuccess: () => {
      // Invalidate all queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['confusionMatrix'] });
      queryClient.invalidateQueries({ queryKey: ['genderDistribution'] });
      queryClient.invalidateQueries({ queryKey: ['geoDistribution'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseIntention'] });
    },
  });
}

export function useAnalyzeText() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.analyzeText(text);
    },
  });
}

export function useGetConfusionMatrix(modelName: string) {
  const { actor, isFetching } = useActor();
  const { data: documents, isLoading: isLoadingDocs } = useGetAllDocuments();

  const hasDocuments = documents && documents.length > 0;

  return useQuery<ConfusionMatrixResult | null>({
    queryKey: ['confusionMatrix', modelName],
    queryFn: async () => {
      if (!actor) return null;
      
      // Return null if no documents exist (dataset is empty)
      if (!hasDocuments) {
        return null;
      }
      
      try {
        const result = await actor.getConfusionMatrix(modelName);
        
        // Validate that the result has proper structure
        if (!result || !result.confusionMatrix || !result.emotions) {
          console.warn('Invalid confusion matrix structure:', result);
          return null;
        }
        
        // Validate matrix dimensions match emotions array
        const expectedSize = result.emotions.length;
        if (result.confusionMatrix.length !== expectedSize) {
          console.warn('Confusion matrix dimensions mismatch:', {
            matrixRows: result.confusionMatrix.length,
            emotionsCount: expectedSize
          });
          return null;
        }
        
        // Validate each row has correct number of columns
        for (const row of result.confusionMatrix) {
          if (row.length !== expectedSize) {
            console.warn('Confusion matrix row dimension mismatch:', {
              rowLength: row.length,
              expected: expectedSize
            });
            return null;
          }
        }
        
        return result;
      } catch (error) {
        console.warn('Confusion matrix not available for', modelName, ':', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !isLoadingDocs && !!modelName && hasDocuments,
    refetchOnMount: true,
    staleTime: 0,
  });
}

export function useResetModelData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (modelName: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.resetModelData(modelName);
    },
    onSuccess: (_, modelName) => {
      queryClient.invalidateQueries({ queryKey: ['confusionMatrix', modelName] });
    },
  });
}

export function useResetAllData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.resetAllData();
    },
    onSuccess: () => {
      // Reset all queries to force fresh data
      queryClient.resetQueries({ queryKey: ['confusionMatrix'] });
      queryClient.resetQueries({ queryKey: ['genderDistribution'] });
      queryClient.resetQueries({ queryKey: ['geoDistribution'] });
      queryClient.resetQueries({ queryKey: ['purchaseIntention'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useGenderDistribution() {
  const { actor, isFetching } = useActor();
  const { data: documents } = useGetAllDocuments();

  return useQuery<GenderDistribution | null>({
    queryKey: ['genderDistribution'],
    queryFn: async () => {
      if (!actor) return null;
      // Return null if no documents exist (dataset is empty)
      if (!documents || documents.length === 0) {
        return null;
      }
      try {
        return await actor.analyzeGenderDistribution();
      } catch (error) {
        console.warn('Gender distribution not available:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!documents && documents.length > 0,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useGeoDistribution() {
  const { actor, isFetching } = useActor();
  const { data: documents } = useGetAllDocuments();

  return useQuery<GeoLocationDistribution | null>({
    queryKey: ['geoDistribution'],
    queryFn: async () => {
      if (!actor) return null;
      // Return null if no documents exist (dataset is empty)
      if (!documents || documents.length === 0) {
        return null;
      }
      try {
        return await actor.analyzeGeoDistribution([]);
      } catch (error) {
        console.warn('Geo distribution not available:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!documents && documents.length > 0,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function usePurchaseIntentionData() {
  const { actor, isFetching } = useActor();
  const { data: documents } = useGetAllDocuments();

  return useQuery<IntentionResult | null>({
    queryKey: ['purchaseIntention'],
    queryFn: async () => {
      if (!actor) return null;
      // Return null if no documents exist (dataset is empty)
      if (!documents || documents.length === 0) {
        return null;
      }
      try {
        // Call backend with sample parameters
        return await actor.calculateIntention('interest', 'male', 'Jakarta', 'Gesits');
      } catch (error) {
        console.warn('Purchase intention data not available:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!documents && documents.length > 0,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useGetLatestCleaningLog() {
  const { actor, isFetching } = useActor();

  return useQuery<CleaningLog[] | null>({
    queryKey: ['cleaningLogs'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getLatestCleaningLog();
      } catch (error) {
        console.warn('Cleaning logs not available:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}
