"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAdminAuth";
import { getAllProductsAdmin, deleteProduct } from "@/lib/admin/products";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Edit, Trash2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductForm from "./ProductForm";
import PageTitile from "../PageTitile";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
        description: "Failed to delete product",
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

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted">
      <div className="max-w-7xl mx-auto">
        <PageTitile
          title="Administrasjon"
          text="Legg til, endre eller slett produkter"
        />
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

      {formOpen && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}
    </div>
  );
}
