"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/features/admin/hooks/useAdminAuth";
import { getAllProductsAdmin, deleteProduct } from "@/features/admin/lib/products";
import {
  getAllFaqsAdmin,
  getAllCategories,
  deleteFaq,
  type FaqItem,
} from "@/features/admin/lib/faqs";
import type { Product } from "@/shared/types/product";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Loader2, Plus, Edit, Trash2, LogOut } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import ProductForm from "./ProductForm";
import FaqForm from "./FaqForm";
import PageTitle from "@/shared/components/common/PageTitle";
import { cn } from "@/shared/lib/utils";

type Tab = "products" | "faqs";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteFaqDialogOpen, setDeleteFaqDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FaqItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [faqFormOpen, setFaqFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getAllProductsAdmin();
      setProducts(fetchedProducts);
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke hente produkter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchFaqs = useCallback(async () => {
    setFaqsLoading(true);
    try {
      const fetchedFaqs = await getAllFaqsAdmin();
      setFaqs(fetchedFaqs);
      const fetchedCategories = await getAllCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke hente FAQs",
        variant: "destructive",
      });
    } finally {
      setFaqsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
    fetchFaqs();
  }, [fetchProducts, fetchFaqs]);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Sletting av produkte er deaktivert av sikkerhetsgrunner",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleFaqFormClose = () => {
    setFaqFormOpen(false);
    setEditingFaq(null);
    fetchFaqs();
  };

  const handleDeleteFaq = async () => {
    if (!faqToDelete?.id) return;

    try {
      await deleteFaq(faqToDelete.id);
      toast({
        title: "Suksess",
        description: "FAQ ble slettet",
      });
      fetchFaqs();
      setDeleteFaqDialogOpen(false);
      setFaqToDelete(null);
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke slette FAQ",
        variant: "destructive",
      });
    }
  };

  const handleEditFaq = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFaqFormOpen(true);
  };

  const handleAddFaq = () => {
    setEditingFaq(null);
    setFaqFormOpen(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading && activeTab === "products") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted">
      <div className="max-w-7xl mx-auto">
        <PageTitle
          title="Administrasjon"
          text="Legg til, endre eller slett produkter og FAQs"
        />
        
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          <Button
            variant={activeTab === "products" ? "default" : "ghost"}
            onClick={() => setActiveTab("products")}
            className="rounded-b-none"
          >
            Produkter
          </Button>
          <Button
            variant={activeTab === "faqs" ? "default" : "ghost"}
            onClick={() => setActiveTab("faqs")}
            className="rounded-b-none"
          >
            FAQs
          </Button>
        </div>

        {activeTab === "products" && (
          <Card>
            <CardHeader>
              <div className="flex justify-end items-center">
                <div className="flex gap-2">
                  <Button onClick={handleAdd} variant="default">
                    <Plus className="mr-2 h-4 w-4" />
                    Legg til produkt
                  </Button>
                  <Button onClick={handleLogout} variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logg ut
                  </Button>
                </div>
              </div>
            </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Ingen produkter funnet</p>
                <Button onClick={handleAdd} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Legg til første produkt
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modell</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fase</TableHead>
                      <TableHead>Pris fra</TableHead>
                      <TableHead>Handlinger</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.model}
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              product.inStock
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-yellow-100 text-yellow-800"
                            )}
                          >
                            {product.inStock ? "På lager" : "Ikke på lager"}
                          </span>
                        </TableCell>
                        <TableCell>{product.specs?.phase}</TableCell>
                        <TableCell>{product.priceFrom}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setProductToDelete(product);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {activeTab === "faqs" && (
          <Card>
            <CardHeader>
              <div className="flex justify-end items-center">
                <div className="flex gap-2">
                  <Button onClick={handleAddFaq} variant="default">
                    <Plus className="mr-2 h-4 w-4" />
                    Legg til FAQ
                  </Button>
                  <Button onClick={handleLogout} variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logg ut
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {faqsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Ingen FAQs funnet</p>
                  <Button onClick={handleAddFaq} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Legg til første FAQ
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Spørsmål</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Svar (forhåndsvisning)</TableHead>
                        <TableHead>Handlinger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faqs.map((faq) => (
                        <TableRow key={faq.id}>
                          <TableCell className="font-medium max-w-xs">
                            <div className="truncate">{faq.question}</div>
                          </TableCell>
                          <TableCell>{faq.category}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate text-sm text-muted-foreground">
                              {faq.answer.substring(0, 100)}
                              {faq.answer.length > 100 ? "..." : ""}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditFaq(faq)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setFaqToDelete(faq);
                                  setDeleteFaqDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil slette "{productToDelete?.model}" permanent. Denne
              handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Slett</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteFaqDialogOpen}
        onOpenChange={setDeleteFaqDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil slette "{faqToDelete?.question}" permanent. Denne
              handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFaq}>
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {formOpen && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      {faqFormOpen && (
        <FaqForm
          faq={editingFaq}
          categories={categories}
          onClose={handleFaqFormClose}
          onSuccess={handleFaqFormClose}
          onCategoriesChange={fetchFaqs}
        />
      )}
    </div>
  );
}
