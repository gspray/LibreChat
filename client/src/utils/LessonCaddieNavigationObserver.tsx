import { useEffect, useRef } from 'react';
import type { PartMetadata } from 'librechat-data-provider';
import { installLessonCaddieNavigationBridge, onToolResult } from './lessonCaddieNavigationBridge';
import { isError } from '~/components/Chat/Messages/Content/ToolOutput/OutputRenderer';

export default function LessonCaddieNavigationObserver({
  name,
  output,
  isSubmitting,
  isLast,
  runStepStatus,
  toolCallId,
}: {
  name: string;
  output?: string | null;
  isSubmitting: boolean;
  isLast?: boolean;
  runStepStatus?: PartMetadata['runStepStatus'];
  toolCallId?: string;
}) {
  const sawSubmittingRef = useRef(false);
  if (isSubmitting) {
    sawSubmittingRef.current = true;
  }
  const hasError = (typeof output === 'string' && isError(output)) || runStepStatus === 'failed';

  useEffect(() => {
    installLessonCaddieNavigationBridge();
  }, []);

  useEffect(() => {
    if (!output || hasError || isSubmitting) {
      return;
    }
    if (runStepStatus && runStepStatus !== 'completed') {
      return;
    }
    onToolResult({
      functionName: name,
      output,
      isLast,
      sawSubmitting: sawSubmittingRef.current,
      hasError,
      toolCallId,
    });
  }, [name, output, isSubmitting, isLast, hasError, runStepStatus, toolCallId]);

  return null;
}
