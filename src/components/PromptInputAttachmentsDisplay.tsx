import { Attachment, AttachmentRemove, AttachmentPreview, Attachments } from "./ai-elements/attachments";
import { usePromptInputAttachments } from "./ai-elements/prompt-input";

export const PromptInputAttachmentsDisplay = () => {
    const attachments = usePromptInputAttachments();
    if (attachments.files.length === 0) {
        return null;
    }
    return (
        <Attachments variant="inline">
            {attachments.files.map((attachment) => (
                <Attachment
                    data={attachment}
                    key={attachment.id}
                    onRemove={() => attachments.remove(attachment.id)}
                >
                    <AttachmentPreview />
                    <AttachmentRemove />
                </Attachment>
            ))}
        </Attachments>
    );
};