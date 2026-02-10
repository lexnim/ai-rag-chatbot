"use client";
import { useCallback, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
    Message,
    MessageContent,
    MessageResponse,
} from "@/components/ai-elements/message";
import {
    ModelSelector,
    ModelSelectorContent,
    ModelSelectorEmpty,
    ModelSelectorGroup,
    ModelSelectorInput,
    ModelSelectorList,
    ModelSelectorLogo,
    ModelSelectorName,
    ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import {
    PromptInput,
    PromptInputBody,
    type PromptInputMessage,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputTools,
    PromptInputActionMenu,
    PromptInputActionMenuContent,
    PromptInputActionMenuTrigger,
    PromptInputActionAddAttachments,
    PromptInputHeader,
    PromptInputButton,
} from "@/components/ai-elements/prompt-input";
import { Spinner } from "@/components/ui/spinner"
import {
    Attachment,
    AttachmentInfo,
    AttachmentPreview,
    Attachments,
} from "@/components/ai-elements/attachments";
import { GlobeIcon } from "lucide-react";
import { chefs, models } from "./model";
import { ModelItem } from "@/components/ModelItem";
import { PromptInputAttachmentsDisplay } from "@/components/PromptInputAttachmentsDisplay";

export default function RagChatBot() {
    const [model, setModel] = useState<string>(models[0].id);
    const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
    const [input, setInput] = useState("");
    const { messages, status, error, sendMessage } = useChat();
    const [useWebSearch, setUseWebSearch] = useState(false);

    const selectedModelData = useMemo(
        () => models.find((m) => m.id === model),
        [model]
    );

    const handleSubmit = (message: PromptInputMessage) => {
        const hasText = Boolean(message.text);
        const hasAttachments = Boolean(message.files?.length);
        // Allow: text (any), or attachments-only when search is off. Block: search on without text, or nothing to send.
        if (!hasText && (useWebSearch || !hasAttachments)) {
            return;
        }
        sendMessage({
            text: message.text || "Sent with attachments",
            files: message.files,
        }, {
            body: {
                model: model,
                useWebSearch: useWebSearch,
            }
        });
        setInput("");
    }

    const toggleWebSearch = useCallback(() => {
        setUseWebSearch((prev) => !prev);
    }, []);

    const handleModelSelect = useCallback((modelId: string) => {
        setModel(modelId);
        setModelSelectorOpen(false);
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-6rem)]">
            <div className="flex flex-col h-full">
                <Conversation className="h-full">
                    <ConversationContent>
                        {messages.map(message => (
                            <Message from={message.role} key={message.id}>
                                <MessageContent>
                                    {message.parts.map((part, i) => {
                                        switch (part.type) {
                                            case "text":
                                                return (
                                                    <MessageResponse key={`${message.id}-${i}`}>
                                                        {part.text}
                                                    </MessageResponse>
                                                );
                                            case "file": {
                                                const fileData = {
                                                    ...part,
                                                    id: `${message.id}-file-${i}`,
                                                };
                                                return (
                                                    <Attachments
                                                        key={`${message.id}-${i}`}
                                                        variant="list"
                                                        className="my-2"
                                                    >
                                                        <Attachment data={fileData}>
                                                            <AttachmentPreview />
                                                            <AttachmentInfo />
                                                        </Attachment>
                                                    </Attachments>
                                                );
                                            }
                                            default:
                                                return null;
                                        }
                                    })}
                                </MessageContent>
                            </Message>
                        ))}
                        {(status === "submitted" || status === "streaming") && <Spinner />}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>

                <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
                    <PromptInputHeader>
                        <PromptInputAttachmentsDisplay />
                    </PromptInputHeader>
                    <PromptInputBody>
                        <PromptInputTextarea value={input} onChange={e => setInput(e.target.value)} />
                    </PromptInputBody>
                    <PromptInputFooter>
                        <PromptInputTools>
                            <PromptInputActionMenu>
                                <PromptInputActionMenuTrigger />
                                <PromptInputActionMenuContent>
                                    <PromptInputActionAddAttachments />
                                </PromptInputActionMenuContent>
                            </PromptInputActionMenu>
                            <PromptInputButton
                                onClick={toggleWebSearch}
                                variant={useWebSearch ? "default" : "ghost"}
                            >
                                <GlobeIcon size={16} />
                                <span>Search</span>
                            </PromptInputButton>
                            <ModelSelector
                                onOpenChange={setModelSelectorOpen}
                                open={modelSelectorOpen}
                            >
                                <ModelSelectorTrigger asChild>
                                    <PromptInputButton>
                                        {selectedModelData?.chefSlug && (
                                            <ModelSelectorLogo
                                                provider={selectedModelData.chefSlug}
                                            />
                                        )}
                                        {selectedModelData?.name && (
                                            <ModelSelectorName>
                                                {selectedModelData.name}
                                            </ModelSelectorName>
                                        )}
                                    </PromptInputButton>
                                </ModelSelectorTrigger>
                                <ModelSelectorContent>
                                    <ModelSelectorInput placeholder="Search models..." />
                                    <ModelSelectorList>
                                        <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                                        {chefs.map((chef) => (
                                            <ModelSelectorGroup heading={chef} key={chef}>
                                                {models
                                                    .filter((m) => m.chef === chef)
                                                    .map((m) => (
                                                        <ModelItem
                                                            isSelected={model === m.id}
                                                            key={m.id}
                                                            m={m}
                                                            onSelect={handleModelSelect}
                                                        />
                                                    ))}
                                            </ModelSelectorGroup>
                                        ))}
                                    </ModelSelectorList>
                                </ModelSelectorContent>
                            </ModelSelector>
                        </PromptInputTools>
                        <PromptInputSubmit disabled={!input && !status} status={status} />
                    </PromptInputFooter>
                </PromptInput>
            </div>
        </div>
    )
}