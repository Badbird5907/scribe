import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentsStore } from "@/lib/stores/documents";
import { Plus, Trash2, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { NameEdit } from "@/components/name-edit";
import { ModelSelect } from "@/components/model-select";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarInput,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function DocumentsList() {
  const { documents, createDocument, deleteDocument } = useDocumentsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const currentId = location.pathname.split("/")[1] ?? "";
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);
  const isMac = navigator.userAgent.includes("Mac");

  return (
    <Sidebar variant="sidebar" className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border w-[16rem] min-w-[16rem] max-w-[16rem] h-screen">
      <SidebarHeader>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Scribe</h2>
          <button
            onClick={() => {
              const id = uuidv4();
              createDocument(id);
              void navigate(`/${id}`);
            }}
            className="p-2 hover:bg-muted rounded-lg transition-colors hover:cursor-pointer"
            title="New Document"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="relative mt-2">
          <SidebarInput
            ref={searchInputRef}
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-16"
          />
          <span className={cn("absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded text-xs text-muted-foreground select-none pointer-events-none", searchQuery.length > 0 && "hidden")}>
            <span className="bg-neutral-900 text-white rounded px-1.5 py-0.5 text-[10px] font-mono">{isMac ? "⌘" : "Ctrl"}</span>
            <span className="bg-neutral-900 text-white rounded px-1.5 py-0.5 text-[10px] font-mono">K</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <AnimatePresence initial={false}>
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.18 }}
                className="list-none"
              >
                <SidebarMenuItem className="h-full group">
                  <SidebarMenuButton asChild isActive={currentId === doc.id} className="h-full hover:cursor-pointer" onClick={() => navigate(`/${doc.id}`)}>
                    <div className="relative w-full">
                      <div className="flex flex-col items-start w-full">
                        <span className="block w-full pr-12 truncate">{doc.title}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(doc.updatedAt, { addSuffix: true })}
                        </span>
                      </div>
                      {/* Gradient overlay, only visible on hover */}
                      <div className="pointer-events-none absolute top-0 right-0 h-full w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{background: 'linear-gradient(to left, rgba(24,24,27,0.85) 70%, transparent)'}} />
                      {/* Buttons fly in from the right, only on hover */}
                      <motion.div
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 40, opacity: 0 }}
                        transition={{ type: 'tween', duration: 0.18 }}
                        className="absolute top-1 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 pointer-events-auto transition-opacity duration-200"
                      >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <NameEdit id={doc.id} />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDocument(doc.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </motion.div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="w-full flex items-center gap-x-2">
          <div className="flex-1 min-w-0">
            <ModelSelect />
          </div>
          <button
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors shadow-md hover:cursor-pointer"
            title="Settings"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
} 