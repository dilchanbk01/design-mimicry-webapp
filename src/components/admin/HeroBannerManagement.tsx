
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BannerList } from "./banner/BannerList";
import { BannerDialog } from "./banner/BannerDialog";
import { useBannerManagement } from "./banner/useBannerManagement";

interface HeroBannerManagementProps {
  searchQuery: string;
}

export function HeroBannerManagement({ searchQuery }: HeroBannerManagementProps) {
  const {
    banners,
    loading,
    isUploading,
    bannerPage,
    setBannerPage,
    dialogOpen,
    setDialogOpen,
    title,
    setTitle,
    description,
    setDescription,
    active,
    setActive,
    previewUrl,
    handleSubmit,
    handleDelete,
    handleToggleActive,
    resetForm
  } = useBannerManagement(searchQuery);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">Hero Banner Management</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button 
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            Add New Banner
          </Button>
        </Dialog>
      </div>

      <Tabs defaultValue="events" onValueChange={(value) => setBannerPage(value)}>
        <TabsList>
          <TabsTrigger value="events">Events Page</TabsTrigger>
          <TabsTrigger value="pet-grooming">Pet Grooming Page</TabsTrigger>
        </TabsList>
      </Tabs>

      <BannerList
        banners={banners}
        loading={loading}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <BannerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        isUploading={isUploading}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        active={active}
        setActive={setActive}
        previewUrl={previewUrl}
        resetForm={resetForm}
      />
    </div>
  );
}
